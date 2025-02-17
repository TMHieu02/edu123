import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchReviews = createAsyncThunk('reviews/fetchReviews', async () => {
  const response = await axiosClient.get('/reviews');
  return response.data;
});

export const createReview = createAsyncThunk('reviews/createReview', async () => {
  const response = await axiosClient.post('/reviews');
  return response.data;
});

export const updateReview = createAsyncThunk('reviews/updateReview', async (payload) => {
  const response = await axiosClient.patch(`/reviews/${payload.id}`, payload.review);
  return response.data;
});

export const deleteReview = createAsyncThunk('reviews/deleteReview', async (id) => {
  await axiosClient.delete(`/reviews/${id}`);
  return id;
});
