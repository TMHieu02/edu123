import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import background from "../../../assets/images/background_dashboard.jpg";

import "./style.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [registeredCourses, setRegisteredCourses] = useState([]);

  const loadCourseRegister = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);

      const response = await axiosClient.get(`/courseRegisters/user/${userId}`);
      const filteredCourses = response.data.filter(
        (course) =>
          course.active === true &&
          course.deleted !== true &&
          course.isActive === true &&
          course.isDeleted !== true
      );

      setRegisteredCourses(filteredCourses);
    } catch (error) {
      console.error("Error fetching registered courses:", error.message);
    }
  };

  useEffect(() => {
    loadCourseRegister();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const CourseItem = ({ course }) => {
    return (
      <div className="">
        <div>
          <div
            className="bg-image hover-overlay hover-zoom ripple rounded"
            onClick={() =>
              handleNavigate(`/user/course/study/${course.courseId}`)
            }
          >
            <img
              src={course.image}
              className="image-course"
              alt={course.title}
              style={{
                width: "220px",
                // height: "50%",
                height: "150px",
                objectFit: "fill",
              }}
            />
            <a href="#!">
              <div className="mask background-color"></div>
            </a>
          </div>
        </div>
        <div class="a" style={{ fontWeight: "bold" }}>
          {course.title}
        </div>
        <div class="a small" className="text-gray-500 text-sm">{course.name}</div>
        {/* <div class="progress col-6">
          <div
            class="progress-bar"
            role="progressbar"
            style={{ width: `${course.progress}%` }}
            aria-valuenow={course.progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div> */}
        
        <div class=" w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
    <div class="bg-blue-600 text-xs  text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${course.progress}%` }}> </div>
  </div>

        <div className=" text-sm">Hoàn thành: {course.progress}%</div>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div class="container-fluid pt-5 overlay">
          <img
            class="img-background"
            width="1555px"
            height="220px"
            style={{ marginTop: "80px" }}
            src={background}
            alt="Đỗ Trung Thành"
            loading="lazy"
          />
          <div class="row"></div>
          <br />
          <br />
          <br />

          <div class="d-inline-block text-black d-flex justify-content-center">
            <ul class="nav nav-tabs text-white mx-auto">
              <li class="nav-item">
                <Link
                  to="/user/dashboard"
                  class="nav-link active"
                  aria-current="page"
                >
                  Khóa học của tôi
                </Link>
              </li>
              <li class="nav-item">
                <Link to="/user/course/activate" class="nav-link">
                  Kích hoạt khóa học
                </Link>
              </li>
              <li class="nav-item">
                <Link to="/user/order/history" class="nav-link">
                  Lịch sử thanh toán
                </Link>
              </li>
            </ul>
          </div>
          <br />
          <br />
          <br />
          {/* nội dung */}
          <div class="progress col-6">
            <div
              class="progress-bar"
              role="progressbar"
              style={{ width: "25%" }}
              aria-valuenow="25"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div className="card mb-4">
            <div className="card-header py-3">
              <h5 className="mb-0 d-inline-block">Khóa học đã đăng ký</h5>
            </div>

            <div className="container card-body">
              <div className="row">
                {registeredCourses.map((course) => (
                  <div
                    className="col-lg-3 col-md-4 col-sm-6 mb-4"
                    key={course.courseId}
                  >
                    <CourseItem course={course} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
