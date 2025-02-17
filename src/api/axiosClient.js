import axios from 'axios';
import queryString from 'query-string';

//https://woozy-wrench-production.up.railway.app/api/v1
//http://localhost:8080/api/v1
const axiosClient = axios.create({
  baseURL: 'https://woozy-wrench-production.up.railway.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: queryString.stringify, 
  },
});
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      console.log(config.headers);
      return { ...config, headers: { ...config.headers, Authorization: 'Bearer ' + accessToken } };
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 400 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        localStorage.removeItem('refreshToken');
        if (!refreshToken) {
          return Promise.reject(error);
        }
        const response = await axiosClient.post('/auth/refresh-token', {
          refresh_token: refreshToken,
        });

        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.access_Token);
          localStorage.setItem('refreshToken', response.data.refresh_Token);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (error) {
        // Xử lý lỗi
        console.log('Gửi lại request' + error);
      }
    }
    return Promise.reject(error);
  }
);
export default axiosClient;
