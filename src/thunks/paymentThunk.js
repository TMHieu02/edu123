import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const createPayment = createAsyncThunk('payments/createPayment', async () => {
  const response = await axiosClient.get('/payment/create_payment');
  return response.data;
});

export const checkTransactionStatus = createAsyncThunk('payments/checkTransactionStatus', async (paymentInfo) => {
  const response = await axiosClient.get('/payment/payment_infor', { params: paymentInfo });
  return response.data;
});
