import { createSlice } from "@reduxjs/toolkit";
import { forgetPassword, changePassword } from "../thunks/authThunk";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    resetPasswordStatus: "idle",
    resetPasswordError: null,
    changePasswordStatus: "idle",
    changePasswordError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(forgetPassword.pending, (state) => {
        state.resetPasswordStatus = "loading";
        state.resetPasswordError = null;
      })
      .addCase(forgetPassword.fulfilled, (state) => {
        state.resetPasswordStatus = "succeeded";
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = "failed";
        state.resetPasswordError = action.error.message;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordStatus = "loading";
        state.changePasswordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordStatus = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordStatus = "failed";
        if (action.payload) {
          state.changePasswordError =
            action.payload.message || "Đổi mật khẩu thất bại";
        } else {
          state.changePasswordError = "Đổi mật khẩu thất bại";
        }
      });
  },
});

export default authSlice.reducer;
