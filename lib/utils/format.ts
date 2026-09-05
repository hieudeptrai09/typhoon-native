export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const PACE_DELTA_DECIMALS = 1;

// A delta is only ever shown rounded, so the rounded value is what everything else has to agree
// with: without this a -0.04 gap prints "0.0" while still being painted as behind average.
export const roundPaceDelta = (delta: number): number => {
  const factor = 10 ** PACE_DELTA_DECIMALS;
  const rounded = Math.round(delta * factor) / factor;
  return rounded === 0 ? 0 : rounded; // collapses -0, which would otherwise print as "-0.0"
};

export const formatPaceDelta = (delta: number): string => {
  const rounded = roundPaceDelta(delta);
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(PACE_DELTA_DECIMALS)}`;
};

export const formatPaceGap = (delta: number): string =>
  Math.abs(roundPaceDelta(delta)).toFixed(PACE_DELTA_DECIMALS);
