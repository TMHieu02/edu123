// orderItemsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchOrderItems, createOrderItem, updateOrderItem, deleteOrderItem } from '../thunks/orderItemThunk';

export const orderItemsSlice = createSlice({
  name: 'orderItems',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createOrderItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateOrderItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrderItem = action.payload;
        const index = state.data.findIndex((item) => item.id === updatedOrderItem.id);
        if (index !== -1) {
          state.data[index] = updatedOrderItem;
        }
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteOrderItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.data = state.data.filter((item) => item.id !== deletedId);
      })
      .addCase(deleteOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectOrderItems = (state) => state.orderItems;

export default orderItemsSlice.reducer;
