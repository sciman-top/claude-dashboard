/**
 * @covers scripts/mod/stdin-builder.ts
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import path from 'path';
import { buildStdin, windowForKind, type ModSnapshot } from '../mod/stdin-builder.js';
import { parseAnsi } from '../mod/ansi.js';

const base: ModSnapshot = {
  sessionId: 'sid', model: 'claude-opus-5-5', cwd: '/w/sub', root: '/w', version: '2.1.289',
  rateLimits: [],
};

describe('windowForKind', () => {
  it.each([
    ['five_hour', 'five_hour'], ['5h', 'five_hour'], ['session', 'five_hour'],
    ['seven_day', 'seven_day'], ['7d', 'seven_day'], ['weekly', 'seven_day'],
    ['seven_day_opus', null], ['weekly_fable', null], ['other', null],
  ])('%s -> %s', (kind, expected) => {
    expect(windowForKind(kind)).toBe(expected);
  });
});

describe('buildStdin', () => {
  it('maps identity and workspace', () => {
    const s = buildStdin(base);
    expect(s.session_id).toBe('sid');
    expect(s.model).toEqual({ id: 'claude-opus-5-5', display_name: 'claude-opus-5-5' });
    expect(s.workspace).toEqual({ current_dir: '/w/sub', project_dir: '/w' });
    expect(s.version).toBe('2.1.289');
  });

  it('maps context and cost', () => {
    const s = buildStdin({ ...base, context: { tokens: 84000, window: 200000, percent: 42 }, costUsd: 1.5 });
    expect(s.context_window).toEqual({
      total_input_tokens: 84000, total_output_tokens: 0, context_window_size: 200000,
      used_percentage: 42, remaining_percentage: 58, current_usage: null,
    });
    expect(s.cost).toEqual({ total_cost_usd: 1.5 });
  });

  it('leaves context unknown before the first response', () => {
    const s = buildStdin(base);
    expect(s.context_window.used_percentage).toBeNull();
    expect(s.context_window.context_window_size).toBe(0);
    expect(s.cost.total_cost_usd).toBe(0);
  });

  it('maps rate limits with epoch-second resets', () => {
    const s = buildStdin({ ...base, rateLimits: [
      { kind: 'five_hour', percentUsed: 30, resetsAt: '2026-10-04T15:00:00Z' },
      { kind: 'seven_day', percentUsed: 12, resetsAt: '2026-10-08T00:00:00Z' },
    ] });
    expect(s.rate_limits).toEqual({
      five_hour: { used_percentage: 30, resets_at: Date.parse('2026-10-04T15:00:00Z') / 1000 },
      seven_day: { used_percentage: 12, resets_at: Date.parse('2026-10-08T00:00:00Z') / 1000 },
    });
  });

  it('drops a window without resetsAt instead of inventing a 1970 reset', () => {
    const s = buildStdin({ ...base, rateLimits: [{ kind: 'five_hour', percentUsed: 30 }] });
    expect(s.rate_limits).toBeUndefined();
  });

  it('reports elapsed session time from the mod-observed start', () => {
    const s = buildStdin({ ...base, startedAt: 1_000_000 }, 1_600_000);
    expect(s.cost).toEqual({ total_cost_usd: 0, total_duration_ms: 600_000 });
  });

  it('omits elapsed time when the start is unknown or in the future', () => {
    expect(buildStdin(base, 5).cost.total_duration_ms).toBeUndefined();
    expect(buildStdin({ ...base, startedAt: 10 }, 5).cost.total_duration_ms).toBeUndefined();
  });

  it('passes transcript path when known', () => {
    expect(buildStdin({ ...base, transcriptPath: '/t.jsonl' }).transcript_path).toBe('/t.jsonl');
    expect(buildStdin(base).transcript_path).toBeUndefined();
  });
});

describe('buildStdin + renderer', () => {
  it('produces stdin the real renderer accepts', () => {
    const root = path.resolve(__dirname, '../..');
    const stdin = buildStdin({ ...base, context: { tokens: 84000, window: 200000, percent: 42 }, costUsd: 1.5 });
    const out = execFileSync('node', [path.join(root, 'dist/index.js')], {
      input: JSON.stringify(stdin), encoding: 'utf8',
      env: { PATH: process.env.PATH!, CLAUDE_DASHBOARD_MOD: '1' },
    });
    const text = out.split('\n').map(l => parseAnsi(l).map(s => s.text).join('')).join('\n');
    expect(text).toContain('42%');
    expect(text).not.toContain('\x1b');
  });
});
