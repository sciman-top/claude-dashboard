/**
 * Builds the statusLine-shaped stdin JSON from what the mod API exposes, so the mod can run
 * the unchanged renderer (dist/index.js). Pure and Node-free: bundled into dist/mod.js.
 * @handbook 9.1-mod-renderer-subprocess
 * @tested scripts/__tests__/mod-stdin-builder.test.ts
 */
import type { StdinInput } from '../types.js';

export interface ModRateLimit {
  kind: string;
  percentUsed: number;
  resetsAt?: string;
}

export interface ModSnapshot {
  sessionId: string;
  model: string;
  cwd: string;
  root?: string;
  version?: string;
  transcriptPath?: string;
  context?: { tokens?: number; window: number; percent?: number };
  rateLimits: ModRateLimit[];
  costUsd?: number;
  /** Session start (epoch ms) from `$.session.usage().startedAt` */
  startedAt?: number;
}

type Window = 'five_hour' | 'seven_day';

// Model-scoped weekly buckets (opus/sonnet/fable) are not the unified windows stdin carries.
const MODEL_SCOPED = /opus|sonnet|fable/i;

export function windowForKind(kind: string): Window | null {
  if (MODEL_SCOPED.test(kind)) return null;
  if (/^(five_hour|5h|session)$/i.test(kind)) return 'five_hour';
  if (/^(seven_day|7d|weekly)$/i.test(kind)) return 'seven_day';
  return null;
}

function rateLimitsFrom(list: ModRateLimit[]): StdinInput['rate_limits'] {
  const out: NonNullable<StdinInput['rate_limits']> = {};
  for (const rl of list) {
    const window = windowForKind(rl.kind);
    const resetsMs = rl.resetsAt ? Date.parse(rl.resetsAt) : NaN;
    if (!window || Number.isNaN(resetsMs)) continue;
    out[window] = { used_percentage: rl.percentUsed, resets_at: Math.floor(resetsMs / 1000) };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function buildStdin(s: ModSnapshot, now: number = Date.now()): StdinInput {
  const percent = s.context?.percent ?? null;
  const stdin: StdinInput = {
    session_id: s.sessionId,
    model: { id: s.model, display_name: s.model },
    workspace: { current_dir: s.cwd, ...(s.root ? { project_dir: s.root } : {}) },
    context_window: {
      total_input_tokens: s.context?.tokens ?? 0,
      total_output_tokens: 0,
      context_window_size: s.context?.window ?? 0,
      used_percentage: percent,
      remaining_percentage: percent === null ? null : 100 - percent,
      current_usage: null,
    },
    cost: { total_cost_usd: s.costUsd ?? 0 },
  };
  // Without it, clock widgets fall back to a session file started at the first mod render,
  // which understates elapsed time and inflates session averages against cumulative cost.
  if (s.startedAt !== undefined && now >= s.startedAt) {
    stdin.cost.total_duration_ms = now - s.startedAt;
  }
  if (s.version) stdin.version = s.version;
  if (s.transcriptPath) stdin.transcript_path = s.transcriptPath;
  const rateLimits = rateLimitsFrom(s.rateLimits);
  if (rateLimits) stdin.rate_limits = rateLimits;
  return stdin;
}
