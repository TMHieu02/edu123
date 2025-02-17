import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRatings,
  createRating,
  updateRating,
  deleteRating,
} from '../thunks/ratingThunk';

export const ratingSlice = createSlice({
  name: 'ratings',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        const index = state.data.findIndex((rating) => rating.id === action.payload.id);
        state.data[index] = action.payload;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.data = state.data.filter((rating) => rating.id !== action.payload);
      });
  },
});

export const selectRatings = (state) => state.ratings;

export default ratingSlice.reducer;
