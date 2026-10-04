/**
 * How the renderer was invoked: by Claude Code's statusLine, or by the claude-dashboard mod
 * (pane / band). Only the mod sets CLAUDE_DASHBOARD_MOD=1; every other variable is ignored
 * without it, so a stray env in the user's shell cannot change the statusLine.
 * @tested scripts/__tests__/render-mode.test.ts
 */
type ModDisplayMode = 'compact' | 'normal' | 'detailed';

export interface RenderMode {
  fromMod: boolean;
  displayMode?: ModDisplayMode;
  markSession?: string;
  clearSession?: string;
}

/**
 * Widgets fed only by stdin's per-request `current_usage`, which the mod API does not expose:
 * under the mod they would show a constant 0%, so mod renders hide them.
 */
export const MOD_UNAVAILABLE_WIDGETS = ['cacheHit', 'tokenBreakdown', 'performance'] as const;

const MOD_DISPLAY_MODES: readonly ModDisplayMode[] = ['compact', 'normal', 'detailed'];

export function resolveRenderMode(env: Record<string, string | undefined>): RenderMode {
  if (env.CLAUDE_DASHBOARD_MOD !== '1') return { fromMod: false };

  if (env.CLAUDE_DASHBOARD_BAND_OFF) {
    return { fromMod: true, clearSession: env.CLAUDE_DASHBOARD_BAND_OFF };
  }

  const mode: RenderMode = { fromMod: true };
  const requested = env.CLAUDE_DASHBOARD_DISPLAY_MODE as ModDisplayMode | undefined;
  if (requested && MOD_DISPLAY_MODES.includes(requested)) mode.displayMode = requested;
  if (env.CLAUDE_DASHBOARD_BAND_SESSION) mode.markSession = env.CLAUDE_DASHBOARD_BAND_SESSION;
  return mode;
}
