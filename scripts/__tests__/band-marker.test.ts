/**
 * @covers scripts/utils/band-marker.ts
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readdirSync, utimesSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import {
  BAND_MARKER_TTL_MS,
  bandMarkerPath,
  markBand,
  clearBand,
  isBandActive,
} from '../utils/band-marker.js';

let dir: string;
beforeEach(() => { dir = mkdtempSync(path.join(os.tmpdir(), 'band-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('band marker', () => {
  it('marks, reports active, and clears', async () => {
    await markBand('abc-123', dir);
    expect(await isBandActive('abc-123', Date.now(), dir)).toBe(true);
    await clearBand('abc-123', dir);
    expect(await isBandActive('abc-123', Date.now(), dir)).toBe(false);
  });

  it('expires after the TTL so a dead mod gives statusLine back', async () => {
    await markBand('abc', dir);
    const p = bandMarkerPath('abc', dir)!;
    const old = (Date.now() - BAND_MARKER_TTL_MS - 1000) / 1000;
    utimesSync(p, old, old);
    expect(await isBandActive('abc', Date.now(), dir)).toBe(false);
  });

  it('is inactive when no marker exists and clear is a no-op', async () => {
    expect(await isBandActive('nope', Date.now(), dir)).toBe(false);
    await expect(clearBand('nope', dir)).resolves.toBeUndefined();
  });

  it('treats an unreadable cache dir as inactive instead of failing the statusLine', async () => {
    const notADir = path.join(dir, 'file');
    writeFileSync(notADir, '');
    await expect(isBandActive('abc', Date.now(), notADir)).resolves.toBe(false);
  });

  it.each(['', '../x', 'a/b', 'a\\b', 'x'.repeat(129)])(
    'rejects unsafe session id %j without touching the filesystem',
    async (id) => {
      expect(bandMarkerPath(id, dir)).toBeNull();
      await markBand(id, dir);
      await clearBand(id, dir);
      expect(await isBandActive(id, Date.now(), dir)).toBe(false);
      expect(readdirSync(dir)).toEqual([]);
      expect(existsSync(path.join(dir, '..', 'x'))).toBe(false);
    },
  );
});
