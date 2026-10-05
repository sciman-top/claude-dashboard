/**
 * @covers scripts/mod/toggle.ts
 */
import { describe, it, expect } from 'vitest';
import { resolveToggle } from '../mod/toggle.js';

describe('resolveToggle', () => {
  it.each([
    ['on', false, true], ['on', true, true],
    ['off', true, false], ['off', false, false],
    [' ON ', false, true], ['Off', true, false],
  ])('%j with current=%s -> %s', (args, current, expected) => {
    expect(resolveToggle(args, current)).toBe(expected);
  });

  it('flips the current state without an argument', () => {
    expect(resolveToggle('', false)).toBe(true);
    expect(resolveToggle('   ', true)).toBe(false);
  });

  it('rejects anything else so the caller can show usage', () => {
    expect(resolveToggle('open', false)).toBeNull();
    expect(resolveToggle('on off', false)).toBeNull();
  });
});
