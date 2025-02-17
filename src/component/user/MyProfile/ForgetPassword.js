import React, { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useNavigate } from "react-router-dom";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [resetPasswordStatus, setResetPasswordStatus] = useState("idle");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEmailSubmitted) {
      sendOtp();
    } else {
      confirmResetPassword();
    }
  };

  const sendOtp = () => {
    setResetPasswordStatus("loading");

    axiosClient
      .post(`/auth/forgetpassword/sendotp/${email}`)
      .then((response) => {
        setIsEmailSubmitted(true);
        setResetPasswordStatus("success");
        setSuccessMessage("Mã xác nhận đã được gửi thành công.");
        console.log(response.data);
      })
      .catch((error) => {
        setResetPasswordStatus("error");
        setResetPasswordError(error.response.data);
        console.error(error.response.data);
      });
  };

  const confirmResetPassword = () => {
    if (newPassword.length < 6) {
      setResetPasswordStatus("error");
      setResetPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetPasswordStatus("error");
      setResetPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setResetPasswordStatus("loading");

    axiosClient
      .post(`/auth/confirm-reset-password/${email}`, {
        confirmationCode,
        newPassword,
      })
      .then((response) => {
        setResetPasswordStatus("success");
        setSuccessMessage(
          "Đổi mật khẩu thành công. Đang chuyển hướng đến trang đăng nhập..."
        );
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/login");
        }, 2000);
        console.log(response.data);
      })
      .catch((error) => {
        setResetPasswordStatus("error");
        setResetPasswordError(error.response.data);
        console.error(error.response.data);
      });
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-sm-9 col-md-7 col-lg-5">
          <div className="card border-0 shadow rounded-3 my-5">
            <div className="card-body p-4 p-sm-5">
              <h2 className="text-center mb-5">
                {isEmailSubmitted
                  ? "Xác nhận mã và Đổi mật khẩu"
                  : "Quên mật khẩu"}
              </h2>
              <form onSubmit={handleSubmit}>
                {!isEmailSubmitted && (
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-bold">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      id="email"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                {isEmailSubmitted && (
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="confirmationCode"
                        className="form-label fw-bold"
                      >
                        Mã xác nhận
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="confirmationCode"
                        id="confirmationCode"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="newPassword"
                        className="form-label fw-bold"
                      >
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label fw-bold"
                      >
                        Nhập lại mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {resetPasswordError && (
                  <div className="alert alert-danger" role="alert">
                    {resetPasswordError}
                  </div>
                )}

                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}

                <div className="text-center"> {/* Centered buttons */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4"
                    disabled={resetPasswordStatus === "loading"}
                  >
                    {resetPasswordStatus === "loading"
                      ? "Đang xử lý..."
                      : isEmailSubmitted
                      ? "Xác nhận và Đổi mật khẩu"
                      : "Gửi mã xác nhận"}
                  </button>

                  
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
