/**
 * Per-session heartbeat marker that hides the statusLine while the mod band is drawing it.
 * Expires on its own (TTL) so a crashed or unloaded mod never leaves statusLine hidden;
 * settings.json is never modified.
 * @tested scripts/__tests__/band-marker.test.ts
 */
import { mkdir, writeFile, unlink, stat } from 'fs/promises';
import path from 'path';
import { FILE_CACHE_DIR } from './file-cache.js';

export const BAND_MARKER_TTL_MS = 180_000;

// Session ids are UUIDs; anything else (path separators, dots) is refused so an env value
// can never steer a write or unlink outside the cache directory.
const SAFE_SESSION_ID = /^[A-Za-z0-9-]{1,128}$/;

export function bandMarkerPath(sessionId: string, dir: string = FILE_CACHE_DIR): string | null {
  if (!SAFE_SESSION_ID.test(sessionId)) return null;
  return path.join(dir, `band-${sessionId}`);
}

export async function markBand(sessionId: string, dir: string = FILE_CACHE_DIR): Promise<void> {
  const file = bandMarkerPath(sessionId, dir);
  if (!file) return;
  await mkdir(dir, { recursive: true });
  await writeFile(file, String(Date.now()));
}

function isMissing(err: unknown): boolean {
  return (err as NodeJS.ErrnoException)?.code === 'ENOENT';
}

export async function clearBand(sessionId: string, dir: string = FILE_CACHE_DIR): Promise<void> {
  const file = bandMarkerPath(sessionId, dir);
  if (!file) return;
  try {
    await unlink(file);
  } catch (err) {
    if (!isMissing(err)) throw err;
  }
}

export async function isBandActive(
  sessionId: string,
  now: number = Date.now(),
  dir: string = FILE_CACHE_DIR,
): Promise<boolean> {
  const file = bandMarkerPath(sessionId, dir);
  if (!file) return false;
  try {
    const { mtimeMs } = await stat(file);
    return now - mtimeMs < BAND_MARKER_TTL_MS;
  } catch (err) {
    if (isMissing(err)) return false;
    throw err;
  }
}
