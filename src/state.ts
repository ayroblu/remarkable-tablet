export type State = {
  x: number;
  y: number;
  pressure: number;
  touch25: number;
  touch47: number;
  touch48: number;
  touch49: number;
  touch52: number;
  touch53: number;
  touch54: number;
  touch55: number;
  touch57: number;
  touch58: number;
};

export const makeState = (onStateChange: (state: State) => void) => {
  let state: State = {
    x: 0,
    y: 0,
    pressure: 0,
    touch25: 0,
    touch47: 0,
    touch48: 0,
    touch49: 0,
    touch52: 0,
    touch53: 0,
    touch54: 0,
    touch55: 0,
    touch57: 0,
    touch58: 0,
  };
  return {
    getState: () => state,
    setState: (newState: Partial<State>) => {
      state = { ...state, ...newState };
      onStateChange(state);
    },
  };
};
