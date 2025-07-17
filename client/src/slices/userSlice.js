import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null, // 'teacher' or 'student'
  name: '',
  kicked: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRole: (state, action) => { state.role = action.payload; },
    setName: (state, action) => { state.name = action.payload; },
    setKicked: (state, action) => { state.kicked = action.payload; },
    resetUser: () => initialState,
  },
});

export const { setRole, setName, setKicked, resetUser } = userSlice.actions;
export default userSlice.reducer;
