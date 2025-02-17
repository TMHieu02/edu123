import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async () => {
  const response = await axiosClient.get('/courses');
  return response.data;
});

export const createCourse = createAsyncThunk('courses/createCourse', async (courseCreateDto) => {
  const response = await axiosClient.post('/courses', courseCreateDto);
  return response.data;
});

export const updateCourse = createAsyncThunk('courses/updateCourse', async ({ id, courseUpdateDto }) => {
  const response = await axiosClient.patch(`/courses/${id}`, courseUpdateDto);
  return response.data;
});

export const deleteCourse = createAsyncThunk('courses/deleteCourse', async (id) => {
  const response = await axiosClient.delete(`/courses/${id}`);
  return response.data;
});

export const calculateCourseRating = createAsyncThunk('courses/calculateCourseRating', async (courseId) => {
  const response = await axiosClient.get(`/courses/calculateCourseRating?courseId=${courseId}`);
  return response.data;
});
