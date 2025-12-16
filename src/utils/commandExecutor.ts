import { spawn } from "child_process";
import { Logger } from "./logger.js";
import { TIMEOUTS } from "../constants.js";

export async function executeCommand(
  command: string,
  args: string[],
  onProgress?: (newOutput: string) => void,
  cwd?: string,
  stdinInput?: string,  // Optional: input to write to stdin (for multiline prompts)
  timeoutMs?: number    // Optional: custom timeout (defaults based on command)
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    Logger.commandExecution(command, args, startTime);

    // Determine timeout: custom > command-specific > default
    const timeout = timeoutMs ?? (
      command === "gemini" ? TIMEOUTS.GEMINI_CLI : TIMEOUTS.SIMPLE_COMMAND
    );

    // Use stdin pipe if stdinInput is provided, otherwise ignore stdin
    const stdinMode = stdinInput ? "pipe" : "ignore";

    const childProcess = spawn(command, args, {
      env: process.env,
      shell: true,
      stdio: [stdinMode, "pipe", "pipe"],
      cwd: cwd,
    });

    // Write to stdin if provided (for multiline prompts that get truncated as args)
    if (stdinInput && childProcess.stdin) {
      childProcess.stdin.write(stdinInput);
      childProcess.stdin.end();
    }

    let stdout = "";
    let stderr = "";
    let isResolved = false;
    let lastReportedLength = 0;

    // Timeout handler - kill process if it takes too long
    const timeoutHandle = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        Logger.error(`Process timeout after ${elapsed}s, killing...`);
        childProcess.kill('SIGTERM');
        // Force kill after 5 seconds if SIGTERM doesn't work
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);
        reject(new Error(`Command timed out after ${timeout / 1000}s. Gemini CLI may be unresponsive.`));
      }
    }, timeout);

    childProcess.stdout?.on("data", (data) => {
      stdout += data.toString();
      
      // Report new content if callback provided
      if (onProgress && stdout.length > lastReportedLength) {
        const newContent = stdout.substring(lastReportedLength);
        lastReportedLength = stdout.length;
        onProgress(newContent);
      }
    });


    // CLI level errors
    childProcess.stderr?.on("data", (data) => {
      stderr += data.toString();
      // find RESOURCE_EXHAUSTED when gemini-2.5-pro quota is exceeded
      if (stderr.includes("RESOURCE_EXHAUSTED")) {
        const modelMatch = stderr.match(/Quota exceeded for quota metric '([^']+)'/);
        const statusMatch = stderr.match(/status["\s]*[:=]\s*(\d+)/);
        const reasonMatch = stderr.match(/"reason":\s*"([^"]+)"/);
        const model = modelMatch ? modelMatch[1] : "Unknown Model";
        const status = statusMatch ? statusMatch[1] : "429";
        const reason = reasonMatch ? reasonMatch[1] : "rateLimitExceeded";
        const errorJson = {
          error: {
            code: parseInt(status),
            message: `GMCPT: --> Quota exceeded for ${model}`,
            details: {
              model: model,
              reason: reason,
              statusText: "Too Many Requests -- > try using gemini-2.5-flash by asking",
            }
          }
        };
        Logger.error(`Gemini Quota Error: ${JSON.stringify(errorJson, null, 2)}`);
      }
    });
    childProcess.on("error", (error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutHandle);
        Logger.error(`Process error:`, error);
        reject(new Error(`Failed to spawn command: ${error.message}`));
      }
    });
    childProcess.on("close", (code) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutHandle);
        if (code === 0) {
          Logger.commandComplete(startTime, code, stdout.length);
          resolve(stdout.trim());
        } else {
          Logger.commandComplete(startTime, code);
          Logger.error(`Failed with exit code ${code}`);
          const errorMessage = stderr.trim() || "Unknown error";
          reject(
            new Error(`Command failed with exit code ${code}: ${errorMessage}`),
          );
        }
      }
    });
  });
}