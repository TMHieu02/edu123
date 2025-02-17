import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../api/axiosClient";

export const forgetPassword = createAsyncThunk(
  "auth/forgetPassword",
  async (formData) => {
    try {
      const response = await axiosClient.post(
        "/auth/forget-password",
        formData
      );
      return response.data;
    } catch (error) {
      console.error("Forget Password Error:", error);
      throw error;
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (changePasswordData) => {
    try {
      const response = await axiosClient.post(
        "/auth/change-password",
        changePasswordData
      );
      return response.data;
    } catch (error) {
      console.error("Change Password Error:", error.response.data);
      throw error;
    }
  }
);
