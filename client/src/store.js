import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import pollReducer from './slices/pollSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    poll: pollReducer,
  },
});
