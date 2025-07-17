import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuestion: null,
  results: null,
  history: [],
  timer: 60,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => { state.currentQuestion = action.payload; },
    setResults: (state, action) => { state.results = action.payload; },
    setHistory: (state, action) => { state.history = action.payload; },
    setTimer: (state, action) => { state.timer = action.payload; },
    resetPoll: () => initialState,
  },
});

export const { setCurrentQuestion, setResults, setHistory, setTimer, resetPoll } = pollSlice.actions;
export default pollSlice.reducer;
