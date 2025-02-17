// paymentsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { createPayment, checkTransactionStatus } from '../thunks/paymentThunk';

export const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    paymentUrl: '',
    transactionStatus: {
      status: '',
      message: '',
      data: '',
    },
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentUrl = action.payload.URL;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(checkTransactionStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkTransactionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionStatus = action.payload;
      })
      .addCase(checkTransactionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectPayments = (state) => state.payments;

export default paymentsSlice.reducer;
