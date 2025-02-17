// courseRegistersSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchCourseRegisters, createCourseRegister, updateCourseRegister, deleteCourseRegister } from '../thunks/courseRegisterThunk';

export const courseRegistersSlice = createSlice({
  name: 'courseRegisters',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseRegisters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseRegisters.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourseRegisters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCourseRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourseRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createCourseRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateCourseRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourseRegister.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourseRegister = action.payload;
        const index = state.data.findIndex((item) => item.id === updatedCourseRegister.id);
        if (index !== -1) {
          state.data[index] = updatedCourseRegister;
        }
      })
      .addCase(updateCourseRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteCourseRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourseRegister.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.data = state.data.filter((item) => item.id !== deletedId);
      })
      .addCase(deleteCourseRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectCourseRegisters = (state) => state.courseRegisters;

export default courseRegistersSlice.reducer;
