// reviewsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../thunks/reviewThunk';

export const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.data.findIndex((review) => review.id === action.payload.id);
        state.data[index] = action.payload;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.data = state.data.filter((review) => review.id !== action.payload);
      });
  },
});

export const selectReviews = (state) => state.reviews;

export default reviewsSlice.reducer;
