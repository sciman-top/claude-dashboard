/**
 * How the renderer was invoked: by Claude Code's statusLine, or by the claude-dashboard mod
 * (pane / band). Only the mod sets CLAUDE_DASHBOARD_MOD=1; every other variable is ignored
 * without it, so a stray env in the user's shell cannot change the statusLine.
 * @tested scripts/__tests__/render-mode.test.ts
 */
import { parsePreset, type Config, type DisplayMode } from '../types.js';

export type ModSurface = 'pane' | 'band';

export interface RenderMode {
  fromMod: boolean;
  surface?: ModSurface;
  markSession?: string;
  clearSession?: string;
  printSettings?: boolean;
}

/**
 * Widgets fed only by stdin's per-request `current_usage`, which the mod API does not expose:
 * under the mod they would show a constant 0%, so mod renders hide them.
 */
export const MOD_UNAVAILABLE_WIDGETS = ['cacheHit', 'tokenBreakdown', 'performance'] as const;

const SURFACES: readonly ModSurface[] = ['pane', 'band'];
const NAMED_MODES: readonly DisplayMode[] = ['compact', 'normal', 'detailed'];

export function resolveRenderMode(env: Record<string, string | undefined>): RenderMode {
  if (env.CLAUDE_DASHBOARD_MOD !== '1') return { fromMod: false };

  if (env.CLAUDE_DASHBOARD_MOD_SETTINGS === '1') return { fromMod: true, printSettings: true };

  if (env.CLAUDE_DASHBOARD_BAND_OFF) {
    return { fromMod: true, clearSession: env.CLAUDE_DASHBOARD_BAND_OFF };
  }

  if (env.CLAUDE_DASHBOARD_BAND_SESSION) {
    return { fromMod: true, surface: 'band', markSession: env.CLAUDE_DASHBOARD_BAND_SESSION };
  }

  const requested = env.CLAUDE_DASHBOARD_SURFACE as ModSurface | undefined;
  return requested && SURFACES.includes(requested)
    ? { fromMod: true, surface: requested }
    : { fromMod: true };
}

/**
 * The layout a mod surface draws: `modPane` / `modBand` from the config, each a display mode
 * name or a preset string. Unset or unparsable, the pane shows `detailed` and the band keeps
 * the statusLine layout (an empty override).
 */
export function resolveModLayout(
  config: Config,
  surface: ModSurface,
): Partial<Pick<Config, 'displayMode' | 'lines'>> {
  const fallback = surface === 'pane' ? { displayMode: 'detailed' as const, lines: undefined } : {};
  const value = surface === 'pane' ? config.modPane : config.modBand;
  if (!value) return fallback;
  if ((NAMED_MODES as readonly string[]).includes(value)) {
    return { displayMode: value as DisplayMode, lines: undefined };
  }
  const lines = parsePreset(value);
  return lines.length > 0 ? { displayMode: 'custom', lines } : fallback;
}
