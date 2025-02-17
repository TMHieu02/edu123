import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const response = await axiosClient.get('/categories');
  return response.data;
});

export const createCategory = createAsyncThunk('categories/createCategory', async (categoryCreateDto) => {
  const response = await axiosClient.post('/categories', categoryCreateDto);
  return response.data;
});

export const updateCategory = createAsyncThunk('categories/updateCategory', async (payload) => {
  const response = await axiosClient.patch(`/categories/${payload.id}`, payload.category);
  return response.data;
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (id) => {
  await axiosClient.delete(`/categories/${id}`);
  return id;
});

export const fetchCategoryFeatures = createAsyncThunk('categories/fetchCategoryFeatures', async (parentCategoryId) => {
  const response = await axiosClient.get(`/categories/${parentCategoryId}/features`);
  return { parentCategoryId, features: response.data };
});

