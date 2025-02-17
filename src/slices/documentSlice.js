// documentsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchDocuments, createDocument, updateDocument, deleteDocument } from '../thunks/documentThunk';

export const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const updatedDocument = action.payload;
        const index = state.data.findIndex((item) => item.id === updatedDocument.id);
        if (index !== -1) {
          state.data[index] = updatedDocument;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.data = state.data.filter((item) => item.id !== deletedId);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectDocuments = (state) => state.documents;

export default documentsSlice.reducer;
