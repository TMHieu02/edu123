import React, { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import shoppingCart from "../../../assets/images/shopping-cart-icon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faThLarge,
  faLanguage,
  faLineChart,
  faDesktop,
  faLightbulb,
  faCode,
  faPencilRuler,
} from "@fortawesome/free-solid-svg-icons";
import "./Headers.css";

import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

export default function Header() {
  const [userDetails, setUserDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const encodedId = localStorage.getItem("userId");
  const userId = atob(encodedId);
  const encodedRoleId = localStorage.getItem("roleId");
  const roleId = atob(encodedRoleId);

  useEffect(() => {
    if (userId) {
      axiosClient
        .get(`/users/${userId}`)
        .then((response) => {
          // console.log("User details response:", response.data);
          setUserDetails(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    // console.log("userDetails:", userDetails);
  }, [userDetails]);

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const accessToken = localStorage.getItem("accessToken");
  //modal login add to card
  const [showAlertModal, setShowAlertModal] = useState(false);
  const handleShowAlertModal = () => setShowAlertModal(true);
  const handleCloseAlertModal = () => setShowAlertModal(false);
  const handleCartClick = (event) => {
    event.preventDefault();

    if (accessToken) {
      navigate("/user/cart");
    } else {
      handleShowAlertModal();      
    }
  };

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const getLastname = (fullName) => {
    const fullNameArray = fullName.split(" ");
    const lastName = fullNameArray[fullNameArray.length - 1];
    return lastName;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/search/${encodeURIComponent(searchQuery)}`);
    }
  };

  const renderAuthButtons = () => {
    if (accessToken) {
      return (
        <React.Fragment>
          {userDetails && userDetails.fullname && (
            <div
              className="btn-group position-relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className=" margin-button-header "
                data-bs-toggle="dropdown"
                aria-expanded={showDropdown}
                style={{
                  padding: 0,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "none",
                }}
              >
                <img
                  src={
                    userDetails?.avatar ||
                    "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg"
                  }
                  alt="Avatar"
                  className="avatar p-0 m-0 "
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                />
              </button>

              <div
                className={`dropdown-menu ${showDropdown ? "show" : ""}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: "absolute", top: "100%", left: 0 }}
              >
                <div className="p-1">
                  <p className="py-0 my-0 fs-6 fw-bold">
                    {userDetails?.fullname}
                  </p>
                  <p className="py-0 my-0 small">{userDetails?.email}</p>
                  <hr className="py-0 my-1 small" />
                </div>
                <Link className="dropdown-item" to="/user/dashboard">
                  Học tập
                </Link>
                {roleId === "1" || roleId === "4" ? (
                  <Link className="dropdown-item" to="/user/register-teacher">
                    Đăng ký giảng viên
                  </Link>
                ) : (
                  <Link className="dropdown-item" to="/teacher/dashboard">
                    Quản lý các khóa học
                  </Link>
                )}
                {(roleId === "2" || roleId === "3") && (
                  <Link className="dropdown-item" to="/teacher/statics">
                    Thống kê
                  </Link>
                )}
                {(roleId === "2" || roleId === "3") && (
                  <Link className="dropdown-item" to="/teacher/edit-info">
                    Cập nhật thông tin giảng viên
                  </Link>
                )}

                <Link className="dropdown-item" to="/user/edit-info">
                  Cập nhật thông tin cá nhân
                </Link>
                {roleId === "2" && (
                  <Link className="dropdown-item" to="/user/payment-control">
                    Doanh số bán hàng
                  </Link>
                )}
                {(roleId === "2" || roleId === "3") && (
                  <Link className="dropdown-item" to="/teacher/payment-info">
                    Thông tin thanh toán
                  </Link>
                )}
                <Link className="dropdown-item" to="/user/change-password">
                  Đổi mật khẩu
                </Link>
                {(roleId === "3") && (
                  <Link className="dropdown-item" to="/admin">
                    Trang Quản Trị Viên
                  </Link>
                )}
                <button
                  className="btn "
                  onClick={handleLogout}
                >
                  &nbsp;Đăng xuất
                </button>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <button
            className="btn btn-primary margin-button-header"
            onClick={() => handleNavigate("/login")}
          >
            Đăng nhập
          </button>
          <button
            className="btn btn-primary margin-button-header"
            onClick={() => handleNavigate("/register")}
          >
            Đăng ký
          </button>
        </React.Fragment>
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("roleId");
    localStorage.removeItem("userId");
    navigate("/");
  };

  //category
  const [showCategories, setShowCategories] = useState(false);

  const handleMouseEnterCategory = () => {
    setShowDropdownCategory(true);
  };

  const handleMouseLeaveCategory = () => {
    setShowDropdownCategory(false);
  };

  const [showDropdownCategory, setShowDropdownCategory] = useState(false);

  return (
    <header className="d-flex justify-content-center py-3 bg-white" id="topbar">
      <div className="d-inline-block">
        <Link to="/" style={{ display: "inline-block" }}>
          <img
            className="img-fluid logo"
            alt="logo"
            src={logo}
            style={{ display: "block", width: "65px", height: "36px" }}
          />
        </Link>
      </div>

      <div className="d-inline-block">
        <div
          className="btn-group position-relative"
          onMouseEnter={handleMouseEnterCategory}
          onMouseLeave={handleMouseLeaveCategory}
        >
          <button
            onMouseEnter={handleMouseEnterCategory}
            onMouseLeave={handleMouseLeaveCategory}
            className="btn  d-flex align-items-center "
            style={{ padding: "5px 10px", borderRadius: "5px" }}
            data-bs-toggle="dropdown"
            aria-expanded={showDropdownCategory}
          >
            <FontAwesomeIcon
              icon={faThLarge}
              size="2x"
              style={{ marginRight: "5px" }}
              color="gray"
            />
          </button>
          <div
            className={`dropdown-menu ${showDropdownCategory ? "show" : ""}`}
            onMouseEnter={handleMouseEnterCategory}
            onMouseLeave={handleMouseLeaveCategory}
            style={{
              position: "absolute",
              top: "100%",
              left: 10,
              width: "225px",
            }}
          >
            <ul className="p-1 list-unstyled ">
              <li className="dropdown ">
                <a
                  href="/searchCategory/11"
                  className="d-block text-decoration-none text-dark "
                  style={{ fontSize: "18px" }}
                >
                  <FontAwesomeIcon icon={faLanguage} className="me-0" /> &nbsp;
                  Ngoại ngữ
                </a>
              </li>
              <li className="dropdown ">
                <a
                  href="/searchCategory/14"
                  className="d-block text-decoration-none text-dark "
                  style={{ fontSize: "18px" }}
                >
                  <FontAwesomeIcon icon={faLineChart} className="me-1" /> &nbsp;
                  Marketing
                </a>
              </li>
              <li className="dropdown">
                <a
                  href="/searchCategory/24"
                  className="d-block text-decoration-none text-dark "
                  style={{ fontSize: "18px" }}
                >
                  <FontAwesomeIcon icon={faDesktop} className="me-0" /> &nbsp;
                  Tin học văn phòng
                </a>
              </li>
              <li className="dropdown ">
                <a
                  href="/searchCategory/25"
                  className="d-block text-decoration-none text-dark "
                  style={{ fontSize: "18px" }}
                >
                  <FontAwesomeIcon icon={faPencilRuler} className="me-1" />{" "}
                  &nbsp; Thiết kế
                </a>
              </li>
              <li className="dropdown">
                <a
                  href="/searchCategory/26"
                  className="d-block text-decoration-none text-dark "
                  style={{ fontSize: "18px" }}
                >
                  <FontAwesomeIcon icon={faLightbulb} className="me-2" /> &nbsp;
                  Phát triển bản thân
                </a>
              </li>
              <li className="dropdown ">
                <a
                  href="/searchCategory/12"
                  className="d-block text-decoration-none text-dark "
                  style={{ fontSize: "18px" }}
                >
                  <FontAwesomeIcon icon={faCode} className="me-0" /> &nbsp; Công
                  nghệ thông tin
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="d-inline-block">
        <form
          className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3"
          onSubmit={(e) => handleSearchSubmit(e)}
        >
          <input
            type="search"
            className="form-control form-control-dark"
            placeholder="Search..."
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="d-inline-block">
        <button
          onClick={handleCartClick}
          className="btn  d-flex align-items-center"
          style={{ padding: "5px 10px", borderRadius: "5px" }}
        >
          <FontAwesomeIcon
            icon={faShoppingCart}
            size="2x"
            style={{ marginRight: "5px" }}
            color="gray"
          />
        </button>
      </div>

      {renderAuthButtons()}

       {/* alert modal */}
       <div
        className="modal"
        tabIndex="-1"
        style={{ display: showAlertModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontWeight: "bold" }}>
                Thông báo
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAlertModal}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className="">Bạn cần đăng nhập vào giỏ hàng</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  navigate("/login");
                  handleCloseAlertModal();
                }}
              >
                Đăng nhập ngay!
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
