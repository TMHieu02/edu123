import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import "../../css/style.css";
import "../../css/headers.css";
import UserAPI from "../../api/UserAPI";

function Register() {
  const navigate = useNavigate();

  const [registerError, setRegisterError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  const [error, setError] = useState({
    passwordWeak: true,
    rePasswordWrong: true,
    invalidEmailFormat: false,
    invalidPhoneFormat: false,
  });
  const [notification, setNotification] = useState(null);

  const [formValues, setFormValues] = useState({
    fullname: "",
    email: "",
    password: "",
    rePassword: "",
    phone: "",
  });

  useEffect(() => {
    const message = localStorage.getItem("message");
    if (message) {
      alert(message);
      localStorage.removeItem("message");
    }
  }, []);

  useEffect(() => {
    checkPassword();
  }, [formValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });

    if (name === "email") {
      const emailRegex = /@/;
      setError((prevState) => ({
        ...prevState,
        invalidEmailFormat: !emailRegex.test(value),
      }));
    }

    if (name === "phone") {
      const phoneRegex = /^[0-9]{10,11}$/;
      setError((prevState) => ({
        ...prevState,
        invalidPhoneFormat: !phoneRegex.test(value),
      }));
    }
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const checkPassword = () => {
    if (formValues.password.length <= 5)
      setError((prevState) => ({ ...prevState, passwordWeak: true }));
    else setError((prevState) => ({ ...prevState, passwordWeak: false }));

    if (formValues.rePassword !== formValues.password)
      setError((prevState) => ({ ...prevState, rePasswordWrong: true }));
    else setError((prevState) => ({ ...prevState, rePasswordWrong: false }));
  };

  const handleRegister = async () => {
    if (!formValues.email) {
      setRegisterError("Email cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const params = {
        fullname: formValues.fullname,
        email: formValues.email,
        password: formValues.password,
        phone: formValues.phone,
      };
      const response = await UserAPI.register(params);
      setIsLoading(false);
      setNotification({
        type: "success",
        message:
          "Đăng kí tài khoản thành công!",
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formValues.email);
        const encodedPassword = btoa(formValues.password);
        localStorage.setItem("rememberedPassword", encodedPassword);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setRegisterError("Email đã tồn tại");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
          <div className="card border-0 shadow rounded-3 my-5">
            <div className="card-body p-4 p-sm-5">
              <h5 className="card-title text-center mb-5 fw-light fs-10 fw-bold text-decoration-underline">
                Đăng ký
              </h5>
              <div>
              {isLoading ? (
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div></div>
              )}
              </div>
              <div>
                <label className="form-label" htmlFor="fullName">
                  <span style={{ color: "red" }}>* Bắt buộc điền</span>
                </label>
              </div>
              <form>
                <div className="form-outline mb-4">
                  <label
                    className={`form-label label-above ${
                      error.invalidEmailFormat && formValues.email.length > 0
                        ? "label-error"
                        : ""
                    }`}
                    htmlFor="fullName"
                  >
                    Họ và tên
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    id="fullName"
                    autoComplete="on"
                    className="form-control"
                    value={formValues.fullname}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-outline mb-4">
                  <label
                    className={`form-label label-above ${
                      error.invalidEmailFormat && formValues.email.length > 0
                        ? "label-error"
                        : ""
                    }`}
                    htmlFor="fullName"
                  >
                    Email
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="on"
                      className="form-control"
                      value={formValues.email}
                      onChange={handleChange}
                    />
                  </div>
                  {error.invalidEmailFormat && formValues.email.length > 0 && (
                    <Alert variant="danger">Không đúng định dạng gmail</Alert>
                  )}
                </div>

                <div className="form-outline mb-4">
                  <label
                    className={`form-label label-above ${
                      error.invalidEmailFormat && formValues.email.length > 0
                        ? "label-error"
                        : ""
                    }`}
                    htmlFor="fullName"
                  >
                    Số điện thoại
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="on"
                      className="form-control"
                      value={formValues.phone}
                      onChange={handleChange}
                    />
                  </div>
                  {error.invalidPhoneFormat && formValues.phone.length > 0 && (
                    <Alert variant="danger">
                      Số điện thoại có 10 hoặc 11 số không có ký tự khác
                    </Alert>
                  )}
                </div>
                <label
                  className={`form-label label-above ${
                    error.invalidEmailFormat && formValues.email.length > 0
                      ? "label-error"
                      : ""
                  }`}
                  htmlFor="fullName"
                >
                  Mật khẩu
                  <span style={{ color: "red" }}> *</span>
                </label>

                <div className="form-outline mb-4">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="on"
                    className="form-control"
                    value={formValues.password}
                    onChange={handleChange}
                  />
                  <div>
                    {error.passwordWeak && formValues.password.length > 0 && (
                      <Alert variant="danger">Mật khẩu ít nhất 6 kí tự</Alert>
                    )}
                  </div>
                </div>

                <label
                  className={`form-label label-above ${
                    error.invalidEmailFormat && formValues.email.length > 0
                      ? "label-error"
                      : ""
                  }`}
                  htmlFor="fullName"
                >
                  Nhập lại mật khẩu
                  <span style={{ color: "red" }}> *</span>
                </label>
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    name="rePassword"
                    id="rePassword"
                    autoComplete="on"
                    className="form-control"
                    value={formValues.rePassword}
                    onChange={handleChange}
                  />
                  <div>
                    {error.rePasswordWrong &&
                      formValues.rePassword.length > 0 && (
                        <Alert variant="danger">
                          Mật khẩu nhập lại không trùng khớp
                        </Alert>
                      )}
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col d-flex justify-content-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="form2Example31"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="form2Example31"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                </div>
                {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}

                <button
                  type="button"
                  className="btn btn-primary btn-block mb-4 w-100"
                  onClick={handleRegister}
                  disabled={
                    error.invalidEmailFormat ||
                    error.invalidPhoneFormat ||
                    error.passwordWeak ||
                    error.rePasswordWrong ||
                    !formValues.email ||
                    !formValues.fullname ||
                    !formValues.phone ||
                    !formValues.password ||
                    !formValues.rePassword
                  }
                >
                  Đăng ký
                </button>

                <div className="text-center mt-5">
                  <p className="light-gray">
                    Already have an Account? <Link to="/login">Đăng nhập</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
