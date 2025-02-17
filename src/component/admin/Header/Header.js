import React, { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import shoppingCart from "../../../assets/images/shopping-cart-icon.png";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import "./Header.css"

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
          console.log("User details response:", response.data);
          setUserDetails(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    console.log("userDetails:", userDetails);
  }, [userDetails]);

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const accessToken = localStorage.getItem("accessToken");

  const getLastname = (fullName) => {
    const fullNameArray = fullName.split(" ");
    const lastName = fullNameArray[fullNameArray.length - 1];
    return lastName;
  };

  const renderAuthButtons = () => {
    if (accessToken) {
      return (
        <React.Fragment>
          <button
                type="button"
                className="btn btn-info margin-button-header mb-2"                                
                onClick={() => handleNavigate("/")}
              >
                <p className="p-0 m-0 ">Trang người dùng</p>
              </button>
          <button
            className="btn btn-danger margin-button-header"
            onClick={handleLogout}
          >
            Đăng xuất&nbsp;&nbsp;
          </button>
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

  return (
    <aside className="sidebar">
    <div className="sidebar-logo">
      <a href="/">
      <img className="img-fluid" alt="logo" src={logo} />
      </a>
    </div>
    <div className="sidebar-links">
    <a href="/admin" className="link-item">
        Dashboard
      </a>
      <a href="/admin/payment-confirm" className="link-item">
        Xác nhận thanh toán
      </a>
      <a href="/admin/upgrade-to-teacher" className="link-item">
        Phê duyệt giảng viên
      </a>
      <a href="/admin/course-approval" className="link-item">
        Phê duyệt khóa học
      </a>      
      <a href="/admin/payment-to-teacher" className="link-item">
        Thanh toán hoa hồng
      </a> 
      <a href="/admin/feedback" className="link-item">
        Xử lý phản hồi người dùng
      </a> 
      <a href="/admin/course-active" className="link-item">
        Quản lý khóa học
      </a>
      <a href="/admin/manager-user" className="link-item">
        Quản lý người dùng
      </a>                                 
    </div>
    <div className="sidebar-auth">
      {renderAuthButtons()}
    </div>
  </aside>
  );
}