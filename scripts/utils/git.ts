/**
 * Git utilities - shared async git command execution
 * @handbook 3.3-widget-data-sources
 */

import { execFile } from 'child_process';

/**
 * Run git command asynchronously with timeout
 */
export function execGit(args: string[], cwd: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('git', ['--no-optional-locks', ...args], {
      cwd,
      encoding: 'utf-8',
      timeout,
    }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
