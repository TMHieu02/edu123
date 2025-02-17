import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchFeedbacks = createAsyncThunk('feedbacks/fetchFeedbacks', async () => {
  const response = await axiosClient.get('/feedbacks');
  return response.data;
});

export const createFeedback = createAsyncThunk('feedbacks/createFeedback', async (feedbackCreateDto) => {
  const response = await axiosClient.post('/feedbacks', feedbackCreateDto);
  return response.data;
});

export const updateFeedback = createAsyncThunk('feedbacks/updateFeedback', async ({ id, feedbackUpdateDto }) => {
  const response = await axiosClient.patch(`/feedbacks/${id}`, feedbackUpdateDto);
  return response.data;
});

export const deleteFeedback = createAsyncThunk('feedbacks/deleteFeedback', async (id) => {
  const response = await axiosClient.delete(`/feedbacks/${id}`);
  return response.data;
});
