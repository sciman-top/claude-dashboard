/**
 * Shared argument rule for the mod's on/off commands: `on`, `off`, or nothing to flip the
 * current state. Pure and Node-free: bundled into dist/mod.js.
 * @handbook 9.4-render-mode-env
 * @tested scripts/__tests__/mod-toggle.test.ts
 */

/** The state to switch to, or null when the argument is not one the command takes. */
export function resolveToggle(args: string, current: boolean): boolean | null {
  const arg = args.trim().toLowerCase();
  if (arg === '') return !current;
  if (arg === 'on') return true;
  if (arg === 'off') return false;
  return null;
}
