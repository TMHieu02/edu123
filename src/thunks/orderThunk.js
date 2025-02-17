import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await axiosClient.get('/orders');
  return response.data;
});

export const createOrder = createAsyncThunk('orders/createOrder', async (orderCreateDto) => {
  const response = await axiosClient.post('/orders', orderCreateDto);
  return response.data;
});

export const updateOrder = createAsyncThunk('orders/updateOrder', async ({ id, orderUpdateDto }) => {
  const response = await axiosClient.patch(`/orders/${id}`, orderUpdateDto);
  return response.data;
});

export const deleteOrder = createAsyncThunk('orders/deleteOrder', async (id) => {
  const response = await axiosClient.delete(`/orders/${id}`);
  return response.data;
});
