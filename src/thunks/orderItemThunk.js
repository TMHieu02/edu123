import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchOrderItems = createAsyncThunk('orderItems/fetchOrderItems', async () => {
  const response = await axiosClient.get('/orderItems');
  return response.data;
});

export const createOrderItem = createAsyncThunk('orderItems/createOrderItem', async (orderItemCreateDto) => {
  const response = await axiosClient.post('/orderItems', orderItemCreateDto);
  return response.data;
});

export const updateOrderItem = createAsyncThunk('orderItems/updateOrderItem', async ({ id, orderItemUpdateDto }) => {
  const response = await axiosClient.patch(`/orderItems/${id}`, orderItemUpdateDto);
  return response.data;
});

export const deleteOrderItem = createAsyncThunk('orderItems/deleteOrderItem', async (id) => {
  const response = await axiosClient.delete(`/orderItems/${id}`);
  return response.data;
});
