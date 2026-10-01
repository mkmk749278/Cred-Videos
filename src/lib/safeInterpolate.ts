import {interpolate as rInterpolate} from 'remotion';

/**
 * remotion's interpolate, tolerant of input ranges that collapse when cues are re-timed to another
 * narration (Telugu edition): each point is nudged to stay strictly after the previous one.
 */
type Opts = Parameters<typeof rInterpolate>[3];

export const interpolate = (input: number, inputRange: readonly number[], outputRange: readonly number[], options?: Opts): number => {
  let fixed: number[] | null = null;
  for (let i = 1; i < inputRange.length; i++) {
    const prev = (fixed ?? inputRange)[i - 1];
    if (!(inputRange[i] > prev)) {
      fixed = fixed ?? [...inputRange];
      fixed[i] = prev + 0.001;
    } else if (fixed) fixed[i] = inputRange[i];
  }
  return rInterpolate(input, fixed ?? inputRange, outputRange, options) as number;
};
