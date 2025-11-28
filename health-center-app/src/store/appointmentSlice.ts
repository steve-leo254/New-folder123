import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '../types';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    fetchAppointmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action: PayloadAction<Appointment[]>) => {
      state.loading = false;
      state.appointments = action.payload;
    },
    fetchAppointmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    cancelAppointment: (state, action: PayloadAction<string>) => {
      const appointment = state.appointments.find(apt => apt.id === action.payload);
      if (appointment) {
        appointment.status = 'cancelled';
      }
    },
  },
});

export const {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  addAppointment,
  updateAppointment,
  cancelAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;