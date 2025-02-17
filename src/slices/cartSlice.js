import { createSlice } from '@reduxjs/toolkit';
import { fetchCarts, createCart, updateCart, deleteCart } from '../thunks/cartThunk';

export const cartsSlice = createSlice({
  name: 'carts',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCarts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCarts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCart.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        const index = state.data.findIndex((cart) => cart.id === action.payload.id);
        state.data[index] = action.payload;
      })
      .addCase(deleteCart.fulfilled, (state, action) => {
        state.data = state.data.filter((cart) => cart.id !== action.payload);
      });
  },
});

export const selectCarts = (state) => state.carts;

export default cartsSlice.reducer;
