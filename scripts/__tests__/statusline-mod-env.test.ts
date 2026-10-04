/**
 * @covers scripts/statusline.ts
 * @covers scripts/utils/render-mode.ts
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync, existsSync } from 'fs';
import os from 'os';
import path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const SID = '11111111-2222-3333-4444-555555555555';
const STDIN = JSON.stringify({
  session_id: SID,
  model: { id: 'claude-opus-5-5', display_name: 'Opus 5.5' },
  workspace: { current_dir: '/tmp' },
  context_window: {
    total_input_tokens: 84000, total_output_tokens: 0, context_window_size: 200000,
    used_percentage: 42, remaining_percentage: 58, current_usage: null,
  },
  cost: { total_cost_usd: 1.23 },
});

let home: string;
const run = (env: Record<string, string> = {}) =>
  execFileSync('node', [path.join(ROOT, 'dist/index.js')], {
    input: STDIN,
    env: { PATH: process.env.PATH!, HOME: home, ...env },
    encoding: 'utf8',
  });
const marker = () => path.join(home, '.cache', 'claude-dashboard', `band-${SID}`);

beforeAll(() => { execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore' }); });
beforeEach(() => { home = mkdtempSync(path.join(os.tmpdir(), 'cd-home-')); });
afterEach(() => { rmSync(home, { recursive: true, force: true }); });

describe('renderer under mod env', () => {
  it('renders normally without a marker', () => {
    expect(run()).toContain('42%');
  });

  it('band render marks the session and still prints', () => {
    const out = run({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_BAND_SESSION: SID });
    expect(out).toContain('42%');
    expect(existsSync(marker())).toBe(true);
  });

  it('statusLine render is suppressed while the band is active', () => {
    run({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_BAND_SESSION: SID });
    expect(run().trim()).toBe('');
  });

  it('pane render is not suppressed by an active band', () => {
    run({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_BAND_SESSION: SID });
    const out = run({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_DISPLAY_MODE: 'detailed' });
    expect(out.split('\n').filter(Boolean).length).toBeGreaterThan(1);
  });

  it('band off clears the marker and statusLine returns', () => {
    run({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_BAND_SESSION: SID });
    expect(run({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_BAND_OFF: SID }).trim()).toBe('');
    expect(existsSync(marker())).toBe(false);
    expect(run()).toContain('42%');
  });
});
