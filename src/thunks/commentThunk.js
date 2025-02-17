import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchComments = createAsyncThunk('comments/fetchComments', async () => {
  const response = await axiosClient.get('/comments');
  return response.data;
});

export const createComment = createAsyncThunk('comments/createComment', async (commentCreateDto) => {
  const response = await axiosClient.post('/comments', commentCreateDto);
  return response.data;
});

export const updateComment = createAsyncThunk('comments/updateComment', async (payload) => {
  const response = await axiosClient.patch(`/comments/${payload.id}`, payload.comment);
  return response.data;
});

export const deleteComment = createAsyncThunk('comments/deleteComment', async (id) => {
  await axiosClient.delete(`/comments/${id}`);
  return id;
});

export const fetchCommentFeatures = createAsyncThunk('comments/fetchCommentFeatures', async (parentCommentId) => {
  const response = await axiosClient.get(`/comments/${parentCommentId}/features`);
  return response.data;
});
