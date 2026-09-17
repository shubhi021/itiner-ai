import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  hp,
  wp,
  fp,
} from '../../src/utils/responsive';

describe('responsive utilities', () => {
  it('exports valid window dimensions', () => {
    expect(typeof SCREEN_WIDTH).toBe('number');
    expect(SCREEN_WIDTH).toBeGreaterThan(0);
    expect(typeof SCREEN_HEIGHT).toBe('number');
    expect(SCREEN_HEIGHT).toBeGreaterThan(0);
  });

  it('provides responsive dimension calculation helpers', () => {
    expect(typeof hp).toBe('function');
    expect(typeof wp).toBe('function');
    expect(typeof fp).toBe('function');

    expect(typeof hp(10)).toBe('number');
    expect(typeof wp(10)).toBe('number');
    expect(typeof fp(2)).toBe('number');
  });
});
