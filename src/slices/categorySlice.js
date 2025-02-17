import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchCategoryFeatures,
} from '../thunks/categoryThunk';

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.data.findIndex((category) => category.id === action.payload.id);
        state.data[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.data = state.data.filter((category) => category.id !== action.payload);
      })
      .addCase(fetchCategoryFeatures.fulfilled, (state, action) => {
        const { parentCategoryId, features } = action.payload;
        const index = state.data.findIndex((category) => category.id === parentCategoryId);

        if (index !== -1) {
          state.data[index].features = features;
        } else {
          console.error(`Parent category with ID ${parentCategoryId} not found.`);
        }
      });
  },
});

export const selectCategories = (state) => state.categories;

export default categoriesSlice.reducer;
