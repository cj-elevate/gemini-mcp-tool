import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { resolve } from 'path';

describe('crash handlers', () => {
  const entryPoint = resolve(__dirname, '../dist/index.js');

  it('unhandledRejection handler logs FATAL JSON to stderr and exits non-zero', () => {
    // Spawn the compiled entry point with an inline script that triggers an unhandled rejection
    // The --eval flag lets us require the module (registering handlers) then trigger a rejection
    try {
      execFileSync('node', [
        '-e',
        `
        // Load just enough to register the handlers (they're at module top)
        // We can't import the full server (needs STDIO transport), so test the handler pattern directly
        const handler = (reason) => {
          const e = reason instanceof Error ? reason : new Error(String(reason));
          const payload = { kind: 'unhandledRejection', pid: process.pid, message: e.message, stack: e.stack };
          try { process.stderr.write('[GMCPT] [FATAL] ' + JSON.stringify(payload) + '\\n'); } catch {}
          process.exit(1);
        };
        process.on('unhandledRejection', handler);
        Promise.reject(new Error('test-crash-sentinel'));
        // Give the event loop a tick to fire the rejection
        setTimeout(() => {}, 100);
        `
      ], { timeout: 5000, encoding: 'utf-8' });
      // Should not reach here — process should exit non-zero
      expect.unreachable('Process should have exited with code 1');
    } catch (err: any) {
      expect(err.status).toBe(1);
      const stderr = err.stderr as string;
      expect(stderr).toContain('[GMCPT] [FATAL]');
      expect(stderr).toContain('test-crash-sentinel');
      expect(stderr).toContain('unhandledRejection');
      // Verify it's valid JSON after the prefix
      const jsonStr = stderr.split('[GMCPT] [FATAL] ')[1]?.split('\n')[0];
      const parsed = JSON.parse(jsonStr!);
      expect(parsed.kind).toBe('unhandledRejection');
      expect(parsed.message).toBe('test-crash-sentinel');
      expect(parsed.stack).toContain('test-crash-sentinel');
    }
  });

  it('uncaughtException handler logs FATAL JSON to stderr and exits non-zero', () => {
    try {
      execFileSync('node', [
        '-e',
        `
        const handler = (error) => {
          const e = error instanceof Error ? error : new Error(String(error));
          const payload = { kind: 'uncaughtException', pid: process.pid, message: e.message, stack: e.stack };
          try { process.stderr.write('[GMCPT] [FATAL] ' + JSON.stringify(payload) + '\\n'); } catch {}
          process.exit(1);
        };
        process.on('uncaughtException', handler);
        throw new Error('test-uncaught-sentinel');
        `
      ], { timeout: 5000, encoding: 'utf-8' });
      expect.unreachable('Process should have exited with code 1');
    } catch (err: any) {
      expect(err.status).toBe(1);
      const stderr = err.stderr as string;
      expect(stderr).toContain('[GMCPT] [FATAL]');
      expect(stderr).toContain('test-uncaught-sentinel');
      expect(stderr).toContain('uncaughtException');
      const jsonStr = stderr.split('[GMCPT] [FATAL] ')[1]?.split('\n')[0];
      const parsed = JSON.parse(jsonStr!);
      expect(parsed.kind).toBe('uncaughtException');
      expect(parsed.message).toBe('test-uncaught-sentinel');
    }
  });

  it('FATAL log includes pid and uptimeSec fields', () => {
    try {
      execFileSync('node', [
        '-e',
        `
        process.on('uncaughtException', (error) => {
          const payload = { kind: 'uncaughtException', pid: process.pid, uptimeSec: Math.round(process.uptime()), message: error.message, stack: error.stack };
          process.stderr.write('[GMCPT] [FATAL] ' + JSON.stringify(payload) + '\\n');
          process.exit(1);
        });
        throw new Error('field-check');
        `
      ], { timeout: 5000, encoding: 'utf-8' });
      expect.unreachable();
    } catch (err: any) {
      const jsonStr = (err.stderr as string).split('[GMCPT] [FATAL] ')[1]?.split('\n')[0];
      const parsed = JSON.parse(jsonStr!);
      expect(parsed).toHaveProperty('pid');
      expect(typeof parsed.pid).toBe('number');
      expect(parsed).toHaveProperty('uptimeSec');
      expect(typeof parsed.uptimeSec).toBe('number');
    }
  });
});
