/**
 * @covers scripts/mod/node-path.ts
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { isMissingExecutable, NODE_LOOKUP_SCRIPT, parseNodePath } from '../mod/node-path.js';

describe('isMissingExecutable', () => {
  it('matches the engine start failure', () => {
    const err = new Error('claude-dashboard: $.process.run(node) failed to start: ENOENT: Executable not found in $PATH: "node"');
    expect(isMissingExecutable(err)).toBe(true);
  });

  it('ignores other failures and non-errors', () => {
    expect(isMissingExecutable(new Error('timed out after 5000 ms'))).toBe(false);
    expect(isMissingExecutable('ENOENT')).toBe(false);
  });
});

describe('parseNodePath', () => {
  it('takes the single path the shell answered', () => {
    expect(parseNodePath('/usr/bin/node\n')).toBe('/usr/bin/node');
  });

  it('picks the highest nvm version by semver, not glob order', () => {
    const v9 = '/h/.nvm/versions/node/v9.11.2/bin/node';
    const v20 = '/h/.nvm/versions/node/v20.0.0/bin/node';
    const v20_1 = '/h/.nvm/versions/node/v20.1.0/bin/node';
    expect(parseNodePath(`${v20}\n${v20_1}\n${v9}\n`)).toBe(v20_1);
  });

  it('returns null without a path', () => {
    expect(parseNodePath('')).toBeNull();
    expect(parseNodePath('node not found\n')).toBeNull();
  });
});

describe('NODE_LOOKUP_SCRIPT', () => {
  let home: string | null = null;
  afterEach(() => {
    if (home) rmSync(home, { recursive: true, force: true });
    home = null;
  });

  function fakeNode(rel: string): string {
    const p = path.join(home!, rel);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, '#!/bin/sh\n');
    chmodSync(p, 0o755);
    return p;
  }

  // No shell that can answer (SHELL unset, PATH without bash/zsh): only the install-path globs run.
  function lookUp(): string | null {
    return parseNodePath(execFileSync('/bin/sh', ['-c', NODE_LOOKUP_SCRIPT], {
      env: { HOME: home!, PATH: '/nonexistent' },
      encoding: 'utf8',
    }));
  }

  it.skipIf(process.platform === 'win32')('falls back to the highest nvm version', () => {
    home = mkdtempSync(path.join(tmpdir(), 'node-lookup-'));
    fakeNode('.nvm/versions/node/v9.11.2/bin/node');
    const latest = fakeNode('.nvm/versions/node/v24.17.0/bin/node');
    fakeNode('.volta/bin/node');
    expect(lookUp()).toBe(latest);
  });

  it.skipIf(process.platform === 'win32')('exits non-zero when no node is found', () => {
    home = mkdtempSync(path.join(tmpdir(), 'node-lookup-'));
    expect(() => lookUp()).toThrow();
  });

  it.skipIf(process.platform === 'win32')('uses other install paths without nvm', () => {
    home = mkdtempSync(path.join(tmpdir(), 'node-lookup-'));
    const volta = fakeNode('.volta/bin/node');
    expect(lookUp()).toBe(volta);
  });
});
