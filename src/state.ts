export type State = {
  x: number;
  y: number;
  pressure: number;
};

export const makeState = (onStateChange: (state: State) => void) => {
  let state: State = {
    x: 0,
    y: 0,
    pressure: 0,
  };
  return {
    getState: () => state,
    setState: (newState: Partial<State>) => {
      state = { ...state, ...newState };
      onStateChange(state);
    },
  };
};
