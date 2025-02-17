import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";

import UploadImage from "./UploadImage";

function EditProfile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const encodedId = localStorage.getItem("userId");
        const userId = atob(encodedId);

        const response = await axiosClient.get(`users/${userId}`);
        const userData = response.data;

        setName(userData.fullname);
        setPhone(userData.phone);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setNameError(false);
    setPhoneError(false);

    if (!name || !phone) {
      setNameError(!name);
      setPhoneError(!phone);
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const trimmedName = name.trim();

    // Validate name
    const nameRegex = /^[^\s].*[^\s]$/;
    if (!trimmedName || !nameRegex.test(trimmedName)) {
      setNameError(true);
      setErrorMessage("Không được nhập dấu cách đầu");
      return;
    }

    // Validate phone
    const phoneRegex = /^\d{9,11}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setPhoneError(true);
      setErrorMessage("Nhập đúng số điện thoại từ 9 đến 11 số.");
      return;
    }

    const encodedId = localStorage.getItem("userId");
    const userId = atob(encodedId);

    const fieldsToUpdate = {
      fullname: trimmedName,
      phone: phone,
    };

    try {
      const response = await axiosClient.patch(
        `users/${userId}`,
        fieldsToUpdate
      );

      if (response.status === 200) {
        setSuccessMessage("User updated successfully");
      } else {
        setErrorMessage("Failed to update user");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while updating user");
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h5 className="card-title text-center mb-5 fw-light fs-10 fw-bold text-decoration-underline">
                  Cập Nhật Thông Tin{" "}
                </h5>
                {successMessage && (
<div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleFormSubmit}>
                  <div>
                    <UploadImage />
                  </div>
                  <div
                    className={`form-outline mb-4 ${
                      nameError ? "has-danger" : ""
                    }`}
                  >
                    <label className="form-label fw-bold" htmlFor="name">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="name"
                      autoComplete="on"
                      className={`form-control ${
                        nameError ? "is-invalid" : ""
                      }`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {nameError && (
                      <div className="invalid-feedback">
                        Please enter your name.
                      </div>
                    )}
                  </div>

                  <div
                    className={`form-outline mb-4 ${
                      phoneError ? "has-danger" : ""
                    }`}
                  >
                    <label className="form-label fw-bold" htmlFor="phone">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        phoneError ? "is-invalid" : ""
                      }`}
                      name="phone"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    {phoneError && (
                      <div className="invalid-feedback">
                        Please enter your phone number.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4 w-50"
                  >
                    Cập nhật
                  </button>
                  <Link
                    to="/user/change-password"
                    className="btn btn-light btn-block mb-4 w-50"
                  >
                    Đổi mật khẩu
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;