import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchVideos = createAsyncThunk('videos/fetchVideos', async () => {
  const response = await axiosClient.get('/videos');
  return response.data;
});

export const createVideo = createAsyncThunk('videos/createVideo', async (videoCreateDto) => {
  const response = await axiosClient.post('/videos', videoCreateDto);
  return response.data;
});

export const updateVideo = createAsyncThunk('videos/updateVideo', async (payload) => {
  const response = await axiosClient.patch(`/videos/${payload.id}`, payload.video);
  return response.data;
});

export const deleteVideo = createAsyncThunk('videos/deleteVideo', async (id) => {
  await axiosClient.delete(`/videos/${id}`);
  return id;
});
