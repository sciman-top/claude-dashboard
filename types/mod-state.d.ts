// Self-contained by the engine's rule (no imports); mirrors Segment in scripts/mod/ansi.ts.
export type DashboardSegment = { text: string; color?: string; bold?: boolean; dim?: boolean };

declare module 'claude-code' {
  interface PluginState {
    'claude-dashboard': {
      paneLines: DashboardSegment[][];
      bandLines: DashboardSegment[][];
    };
  }
}
