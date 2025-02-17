import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async () => {
  const response = await axiosClient.get('/documents');
  return response.data;
});

export const createDocument = createAsyncThunk('documents/createDocument', async (documentCreateDto) => {
  const response = await axiosClient.post('/documents', documentCreateDto);
  return response.data;
});

export const updateDocument = createAsyncThunk('documents/updateDocument', async ({ id, documentUpdateDto }) => {
  const response = await axiosClient.patch(`/documents/${id}`, documentUpdateDto);
  return response.data;
});

export const deleteDocument = createAsyncThunk('documents/deleteDocument', async (id) => {
  const response = await axiosClient.delete(`/documents/${id}`);
  return response.data;
});
