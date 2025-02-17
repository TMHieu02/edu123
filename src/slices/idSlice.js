

import { createSlice } from '@reduxjs/toolkit';

const idSlice = createSlice({
  name: 'id',
  initialState: null,
  reducers: {
    setId: (state, action) => {
      console.log('Action setId is called with payload:', action.payload);
      return action.payload;
    },
  },
});

export const { setId } = idSlice.actions;

export const selectId = (state) => state.id;

export default idSlice.reducer;
