import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../user/Footer/Footer";
import { toast } from "react-toastify";
import { Alert } from "react-bootstrap"; 

import {
  faFacebookF,
  faGoogle,
  faGit,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

import UserAPI from "../../api/UserAPI";
import { useUser } from "../../provider/UserProvider";

function Login() {
  const navigate = useNavigate();
  const { setUserIdValue } = useUser();
  const [error, setError] = useState({
    passwordWeak: false,
    emailPasswordNotFound: false,
  });
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading
  

  const [formValues, setFormValues] = useState({
    password: "",
    email: "",
  });

  const [loginError, setLoginError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem("message");
    if (message) {
      toast.error(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      localStorage.removeItem("message");
    }
  }, []);

  useEffect(() => {
    checkPassword();
  }, [formValues]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedEmail && rememberedPassword) {
      setFormValues({
        email: rememberedEmail,
        password: atob(rememberedPassword),
      });
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const checkPassword = () => {
    setError((prevState) => ({
      ...prevState,
      passwordWeak: formValues.password.length <= 5,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Kiểm tra định dạng email
    if (name === "email") {
      const emailRegex = /@/;
      setError((prevState) => ({
        ...prevState,
        invalidEmailFormat: !emailRegex.test(value),
      }));
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const params = { email: formValues.email, password: formValues.password };
      setIsLoading(true);
      const response = await toast.promise(UserAPI.login(params), {
        pending: "Đang đăng nhập...",
        success: "Đăng nhập thành công!",
        error: "Đăng nhập thất bại.",
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setIsLoading(false);


      const user = response.data.UserProfileDto;

      // Log the value of isDeleted for debugging
      console.log("IsDeleted:", user.isDeleted);

      // Check if the user is deleted
      if (user && user.isDeleted) {
        setLoginError(
          "Tài khoản của bạn đã bị xóa. Liên hệ quản trị viên để biết thêm thông tin."
        );
      setIsLoading(false);
        return;
      }

      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formValues.email);
        const encodedPassword = btoa(formValues.password);
        localStorage.setItem("rememberedPassword", encodedPassword);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      if (accessToken !== null) {
        const roleId = response.data.UserProfileDto.roleId;
        const encodedRoleId = btoa(roleId); // Mã hóa roleId
        localStorage.setItem("roleId", encodedRoleId);
        const destination = roleId === 3 ? "/admin" : "/user";
        setUserIdValue(response.data.UserProfileDto.Id);
        const Id = response.data.UserProfileDto.Id;
        const encodedId = btoa(Id);
        localStorage.setItem("userId", encodedId);

        setTimeout(() => {
          navigate(destination);
        }, 1000);
      } else {
        setError((prevState) => ({
          ...prevState,
          emailPasswordNotFound: true,
        }));
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setLoginError("Đăng nhập thất bại kiểm tra lại thông tin!!!");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
          <div className="card border-0 shadow rounded-3 my-5">
            <div className="card-body p-4 p-sm-5">
              <h5 className="card-title text-center mb-5 fw-light fs-10 fw-bold text-decoration-underline">
                Sign In
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
                    Email address
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="on"
                    className="form-control"
                    value={formValues.email}
                    onChange={handleChange}
                  />

                  {error.invalidEmailFormat && formValues.email.length > 0 && (
                    <Alert variant="warning">
                      Định dạng email không hợp lệ.
                    </Alert>
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
                    Password
                    <span style={{ color: "red" }}> *</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="on"
                    className="form-control"
                    value={formValues.password}
                    onChange={handleChange}
                  />
                  {error.passwordWeak && formValues.password.length > 0 && (
                    <Alert variant="warning">Mật khẩu ít nhất 6 kí tự</Alert>
                  )}

                  {loginError && <Alert variant="danger">{loginError}</Alert>}
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
                  <div className="col">
                    <Link to="/forget-password">Forgot password?</Link>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-block mb-4 w-100"
                  onClick={handleLogin}
                  disabled={
                    error.invalidEmailFormat ||
                    error.invalidPhoneFormat ||
                    error.passwordWeak ||
                    error.rePasswordWrong ||
                    !formValues.email ||
                    !formValues.password
                  }
                >
                  Sign in
                </button>
                <div className="text-center">
                  <p>
                    Not a member? <Link to="/register">Register</Link>
                  </p>
                  
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
