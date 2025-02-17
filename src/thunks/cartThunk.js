import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchCarts = createAsyncThunk('carts/fetchCarts', async () => {
  const response = await axiosClient.get('/carts');
  return response.data;
});

export const createCart = createAsyncThunk('carts/createCart', async () => {
  const response = await axiosClient.post('/carts');
  return response.data;
});

export const updateCart = createAsyncThunk('carts/updateCart', async (payload) => {
  const response = await axiosClient.patch(`/carts/${payload.id}`, payload.cart);
  return response.data;
});

export const deleteCart = createAsyncThunk('carts/deleteCart', async (id) => {
  await axiosClient.delete(`/carts/${id}`);
  return id;
});
