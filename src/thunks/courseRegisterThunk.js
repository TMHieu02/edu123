import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchCourseRegisters = createAsyncThunk('courseRegisters/fetchCourseRegisters', async () => {
  const response = await axiosClient.get('/courseRegisters');
  return response.data;
});

export const createCourseRegister = createAsyncThunk('courseRegisters/createCourseRegister', async (courseRegisterCreateDto) => {
  const response = await axiosClient.post('/courseRegisters/register', courseRegisterCreateDto);
  return response.data;
});

export const updateCourseRegister = createAsyncThunk('courseRegisters/updateCourseRegister', async ({ id, courseRegisterUpdateDto }) => {
  const response = await axiosClient.patch(`/courseRegisters/${id}`, courseRegisterUpdateDto);
  return response.data;
});

export const deleteCourseRegister = createAsyncThunk('courseRegisters/deleteCourseRegister', async (id) => {
  const response = await axiosClient.delete(`/courseRegisters/${id}`);
  return response.data;
});
