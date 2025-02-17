import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchRatings = createAsyncThunk('ratings/fetchRatings', async () => {
  const response = await axiosClient.get('/ratings');
  return response.data;
});

export const createRating = createAsyncThunk('ratings/createRating', async (input) => {
  const response = await axiosClient.post('/ratings', input);
  return response.data;
});

export const updateRating = createAsyncThunk('ratings/updateRating', async (payload) => {
  const response = await axiosClient.patch(`/ratings/${payload.id}`, payload.rating);
  return response.data;
});

export const deleteRating = createAsyncThunk('ratings/deleteRating', async (id) => {
  await axiosClient.delete(`/ratings/${id}`);
  return id;
});
