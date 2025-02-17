import axiosClient from "./axiosClient";

const UserAPI = {
  register: (params) => {
    const url = "/auth/register";
    return axiosClient.post(url, params);
  },

  login: (params) => {
    const url = "/auth/login";
    return axiosClient.post(url, {
      email: params.email,
      password: params.password,
    });
  },
  uploadImage: (formData) => {
    const url = "/cloud/images/upload";
    return axiosClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadVideo: (formData) => {
    const url = "/cloud/videos/upload";
    return axiosClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};

export default UserAPI;
