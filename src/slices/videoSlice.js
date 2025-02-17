import { createSlice } from '@reduxjs/toolkit';
import { fetchVideos, createVideo, updateVideo, deleteVideo } from '../thunks/videoThunk';

export const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createVideo.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        const index = state.data.findIndex((video) => video.id === action.payload.id);
        state.data[index] = action.payload;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.data = state.data.filter((video) => video.id !== action.payload);
      });
  },
});

export const selectVideos = (state) => state.videos;

export default videosSlice.reducer;
