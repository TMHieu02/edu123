import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../../thunks/authThunk";
import { useNavigate, Link } from "react-router-dom";
import Header from "../Header/Header";

function ChangePassword() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.changePasswordStatus);
  const changePasswordError = useSelector(
    (state) => state.auth.changePasswordError
  );
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    rePassword: "",
  });

  const handleChange = (e) => {
    setErrorMessages({ ...errorMessages, [e.target.name]: "" });
    switch (e.target.name) {
      case "email":
        setEmail(e.target.value);
        break;
      case "oldPassword":
        setOldPassword(e.target.value);
        break;
      case "newPassword":
        setNewPassword(e.target.value);
        break;
      case "rePassword":
        setRePassword(e.target.value);
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrorMessages = {
      email: "",
      oldPassword: "",
      newPassword: "",
      rePassword: "",
    };

    if (!email.includes("@")) {
      newErrorMessages.email =
        "Email không hợp lệ. Vui lòng nhập đúng định dạng email.";
      isValid = false;
    }

    if (oldPassword.length < 6) {
      newErrorMessages.oldPassword = "Mật khẩu cũ phải có ít nhất 6 kí tự.";
      isValid = false;
    }

    if (oldPassword === newPassword) {
      newErrorMessages.oldPassword = "Mật khẩu mới phải khác mật khẩu cũ.";
      isValid = false;
    }

    if (newPassword.length < 6) {
      newErrorMessages.newPassword = "Mật khẩu mới phải có ít nhất 6 kí tự.";
      isValid = false;
    }

    if (newPassword !== rePassword) {
      newErrorMessages.rePassword =
        "Xác nhận mật khẩu không khớp. Vui lòng nhập lại.";
      isValid = false;
    }

    setErrorMessages(newErrorMessages);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      if (email && oldPassword && newPassword && rePassword && userId) {
        dispatch(
          changePassword({
            userId: userId,
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword,
            rePassword: rePassword,
          })
        ).then((result) => {
          if (result.error) {
            if (result.payload?.statusCode === 400) {
              alert("Đổi mật khẩu thất bại. Xin kiểm tra lại thông tin.");
            } else {
              alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
          } else {
            localStorage.clear();
            navigate("/login");
          }
        });
      }
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
                Đổi mật khẩu{" "}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="form-outline mb-4">
                  <label className="form-label fw-bold" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => handleChange(e)}
                  />
                </div>
                {errorMessages.email && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessages.email}
                  </div>
                )}
                <div className="form-outline mb-4">
                  <label className="form-label fw-bold" htmlFor="password">
                    Mật khẩu cũ
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    className="form-control"
                    value={oldPassword}
                    onChange={(e) => handleChange(e)}
                  />
                </div>
                {errorMessages.oldPassword && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessages.oldPassword}
                  </div>
                )}
                <div className="form-outline mb-4">
                  <label className="form-label fw-bold" htmlFor="newPassword">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => handleChange(e)}
                  />
                </div>
                {errorMessages.newPassword && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessages.newPassword}
                  </div>
                )}
                <div className="form-outline mb-4">
                  <label className="form-label fw-bold" htmlFor="rePassword">
                    Nhập lại mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="rePassword"
                    name="rePassword"
                    className="form-control"
                    value={rePassword}
                    onChange={(e) => handleChange(e)}
                  />
                </div>
                {errorMessages.rePassword && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessages.rePassword}
                  </div>
                )}
                {changePasswordError && (
                  <div className="alert alert-danger" role="alert">
                    {changePasswordError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-block mb-4 w-50"
                  disabled={authStatus === "loading"}
                >
                  {authStatus === "loading" ? "Cập nhật..." : "Cập nhật"}
                </button>
                <Link
                  to="/user/edit-info"
                  className="btn btn-light btn-block mb-4 w-50"
                >
                  Edit Profile
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

export default ChangePassword;
