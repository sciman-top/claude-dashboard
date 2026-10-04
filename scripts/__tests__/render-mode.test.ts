/**
 * @covers scripts/utils/render-mode.ts
 */
import { describe, it, expect } from 'vitest';
import { resolveRenderMode } from '../utils/render-mode.js';

describe('resolveRenderMode', () => {
  it('is a plain statusLine render without mod env', () => {
    expect(resolveRenderMode({})).toEqual({ fromMod: false });
  });

  it('reads display mode override only from the mod', () => {
    expect(resolveRenderMode({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_DISPLAY_MODE: 'detailed' }))
      .toEqual({ fromMod: true, displayMode: 'detailed' });
    expect(resolveRenderMode({ CLAUDE_DASHBOARD_DISPLAY_MODE: 'detailed' })).toEqual({ fromMod: false });
  });

  it('ignores unknown display modes', () => {
    expect(resolveRenderMode({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_DISPLAY_MODE: 'huge' }))
      .toEqual({ fromMod: true });
  });

  it('band off wins over band session', () => {
    expect(resolveRenderMode({
      CLAUDE_DASHBOARD_MOD: '1',
      CLAUDE_DASHBOARD_BAND_SESSION: 'a',
      CLAUDE_DASHBOARD_BAND_OFF: 'a',
    })).toEqual({ fromMod: true, clearSession: 'a' });
  });

  it('marks the band session', () => {
    expect(resolveRenderMode({ CLAUDE_DASHBOARD_MOD: '1', CLAUDE_DASHBOARD_BAND_SESSION: 'a' }))
      .toEqual({ fromMod: true, markSession: 'a' });
  });
});
