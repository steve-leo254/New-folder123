import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import appointmentSlice from './appointmentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointments: appointmentSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;