import { describe, it, expect } from 'vitest';
import { buildThinkingConfig, classifyError, type ThinkingLevel } from './geminiExecutor.js';
import { ERROR_CODES } from '../constants.js';

describe('buildThinkingConfig', () => {
  it('defaults to MEDIUM when no level specified', () => {
    const config = buildThinkingConfig();
    expect(config).toEqual({ thinkingLevel: 'MEDIUM' });
  });

  it('respects explicit thinkingLevel override', () => {
    const config = buildThinkingConfig('MINIMAL');
    expect(config).toEqual({ thinkingLevel: 'MINIMAL' });
  });

  it('supports all thinkingLevel values', () => {
    const levels: ThinkingLevel[] = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'];
    for (const level of levels) {
      const config = buildThinkingConfig(level);
      expect(config).toEqual({ thinkingLevel: level });
    }
  });

  it('never includes thinkingBudget (Gemini 3+ only)', () => {
    const config = buildThinkingConfig();
    expect(config).not.toHaveProperty('thinkingBudget');
  });

  it('always returns a config object (never undefined)', () => {
    const config = buildThinkingConfig();
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});

describe('classifyError', () => {
  it('classifies RESOURCE_EXHAUSTED as quota error', () => {
    const result = classifyError(new Error('RESOURCE_EXHAUSTED'));
    expect(result.code).toBe(ERROR_CODES.QUOTA_EXHAUSTED);
    expect(result.retryable).toBe(true);
    expect(result.message).toContain('[GEMINI_QUOTA_EXHAUSTED]');
  });

  it('classifies 429 status as quota error', () => {
    const error = Object.assign(new Error('Too many requests'), { status: 429 });
    const result = classifyError(error);
    expect(result.code).toBe(ERROR_CODES.QUOTA_EXHAUSTED);
    expect(result.retryable).toBe(true);
  });

  it('classifies rateLimitExceeded as rate limited', () => {
    const result = classifyError(new Error('rateLimitExceeded'));
    expect(result.code).toBe(ERROR_CODES.RATE_LIMITED);
    expect(result.retryable).toBe(true);
  });

  it('classifies UNAVAILABLE as overloaded', () => {
    const result = classifyError(new Error('UNAVAILABLE'));
    expect(result.code).toBe(ERROR_CODES.OVERLOADED);
    expect(result.retryable).toBe(true);
  });

  it('classifies 503 status as overloaded', () => {
    const error = Object.assign(new Error('Service unavailable'), { status: 503 });
    const result = classifyError(error);
    expect(result.code).toBe(ERROR_CODES.OVERLOADED);
    expect(result.retryable).toBe(true);
  });

  it('classifies UNAUTHENTICATED as auth failure', () => {
    const result = classifyError(new Error('UNAUTHENTICATED'));
    expect(result.code).toBe(ERROR_CODES.AUTH_FAILED);
    expect(result.retryable).toBe(false);
  });

  it('classifies PERMISSION_DENIED as auth failure', () => {
    const result = classifyError(new Error('PERMISSION_DENIED'));
    expect(result.code).toBe(ERROR_CODES.AUTH_FAILED);
    expect(result.retryable).toBe(false);
  });

  it('classifies timeout errors', () => {
    const result = classifyError(new Error('Gemini request timed out after 300s'));
    expect(result.code).toBe(ERROR_CODES.TIMEOUT);
    expect(result.retryable).toBe(true);
  });

  it('classifies unknown errors as GEMINI_ERROR', () => {
    const result = classifyError(new Error('Something unexpected'));
    expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    expect(result.retryable).toBe(false);
    expect(result.message).toContain('Something unexpected');
  });

  it('handles non-Error objects', () => {
    const result = classifyError('raw string error');
    expect(result.code).toBe(ERROR_CODES.UNKNOWN);
    expect(result.message).toContain('raw string error');
  });

  it('all error messages include bracketed code prefix', () => {
    const errors = [
      new Error('RESOURCE_EXHAUSTED'),
      new Error('rateLimitExceeded'),
      new Error('UNAVAILABLE'),
      new Error('UNAUTHENTICATED'),
      new Error('timed out'),
      new Error('something else'),
    ];
    for (const err of errors) {
      const result = classifyError(err);
      expect(result.message).toMatch(/^\[GEMINI_/);
    }
  });
});
