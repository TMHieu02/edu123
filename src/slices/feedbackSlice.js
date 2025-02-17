import { createSlice } from '@reduxjs/toolkit';
import { fetchFeedbacks, createFeedback, updateFeedback, deleteFeedback } from '../thunks/feedbackThunk';

export const feedbacksSlice = createSlice({
  name: 'feedbacks',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFeedback = action.payload;
        const index = state.data.findIndex((item) => item.id === updatedFeedback.id);
        if (index !== -1) {
          state.data[index] = updatedFeedback;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.data = state.data.filter((item) => item.id !== deletedId);
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectFeedbacks = (state) => state.feedbacks;

export default feedbacksSlice.reducer;
