import { createSlice } from '@reduxjs/toolkit';
import { fetchComments, createComment, updateComment, deleteComment, fetchCommentFeatures } from '../thunks/commentThunk';

export const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.data.findIndex((comment) => comment.id === action.payload.id);
        state.data[index] = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.data = state.data.filter((comment) => comment.id !== action.payload);
      })
      .addCase(fetchCommentFeatures.fulfilled, (state, action) => {
        // Handle the fetched comment features data as needed
      });
  },
});

export const selectComments = (state) => state.comments;

export default commentsSlice.reducer;
