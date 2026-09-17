import {renderHook, act} from '@testing-library/react-native';
import {useDebounce} from '../../src/utils/useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const {result} = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('updates debounced value only after specified delay', () => {
    const {result, rerender} = renderHook(
      ({value, delay}: {value: string; delay: number}) =>
        useDebounce(value, delay),
      {
        initialProps: {value: 'first', delay: 300},
      },
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({value: 'second', delay: 300});

    // Still old value before timer expires
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    // Advances past delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('second');
  });

  it('resets timer if value changes before delay completes', () => {
    const {result, rerender} = renderHook(
      ({value, delay}: {value: string; delay: number}) =>
        useDebounce(value, delay),
      {
        initialProps: {value: 'a', delay: 300},
      },
    );

    rerender({value: 'ab', delay: 300});
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({value: 'abc', delay: 300});
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });

  it('cleans up timeout on unmount without errors', () => {
    const {unmount} = renderHook(() => useDebounce('test', 500));
    expect(() => unmount()).not.toThrow();
  });
});
