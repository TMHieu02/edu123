import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import CourseCard from "./CourseCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLanguage,
  faBullhorn,
  faDesktop,
  faPencilRuler,
  faUserGraduate,
  faShoppingCart,
  faCogs,
  faLaptopCode,
  faHeartbeat,
  faLifeRing,
} from "@fortawesome/free-solid-svg-icons";
import imageteacher from "../../../assets/images/online-teacher.jpg";
import AsyncStorage from "@react-native-async-storage/async-storage";

import "./HomePageContent.css";
const HomePageCotent = () => {
  const navigate = useNavigate();
  const [topNewCourses, setTopNewCourses] = useState([]);
  const [topSoldCourses, settopSoldCourses] = useState([]);
  const [topRatingCourses, settopRatingCourses] = useState([]);
  const [courseProposal, setCourseProposal] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCourseProposal = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      if (userID) {
        // Dữ liệu đã tồn tại
        console.log("User id :", userID + " đã đăng nhập");
        const response = await axiosClient.get(
          `/courses/propose/user=${userID}`
        );
        // Kiểm tra độ dài của dữ liệu và chỉ lấy tối đa 4 phần tử
        if (response.data.length > 4) {
          setCourseProposal(response.data.slice(0, 4));
        } else {
          setCourseProposal(response.data);
        }
      } else {
        console.log("Chưa có tài khoản đăng nhập!");
      }
    } catch (e) {
      // Xử lý lỗi nếu có
      console.log("Lỗi khi lấy dữ liệu:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch data from AsyncStorage
        const storedCourses = await AsyncStorage.getItem("courses");
        if (storedCourses) {
          const parsedCourses = JSON.parse(storedCourses);
          setTopNewCourses(parsedCourses.topNewCourses);
          settopSoldCourses(parsedCourses.topSoldCourses);
          settopRatingCourses(parsedCourses.topRatingCourses);
        }

        // Fetch new courses from the server if not available in AsyncStorage
        const newCoursesResponse = await axiosClient.get(
          "/courses/get4CourseNewRelateInfo"
        );
        setTopNewCourses(newCoursesResponse.data);

        // Fetch top sold courses
        const soldCoursesResponse = await axiosClient.get(
          "/courses/get4CourseSoldRelateInfo"
        );
        settopSoldCourses(soldCoursesResponse.data);

        // Fetch top rating courses
        const ratingCoursesResponse = await axiosClient.get(
          "/courses/get4CourseRatingRelateInfo"
        );
        settopRatingCourses(ratingCoursesResponse.data);

        // Update AsyncStorage with all courses data
        await AsyncStorage.setItem(
          "courses",
          JSON.stringify({
            topNewCourses: newCoursesResponse.data,
            topSoldCourses: soldCoursesResponse.data,
            topRatingCourses: ratingCoursesResponse.data,
          })
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setIsLoading(false);
      }
    };

    fetchData();    
  }, []);

  useEffect(() => {    
    getCourseProposal();
  }, []);

  return (
    <div className="container-fluid col-md-10">
      <div className="row">
        <div className="center_body">
          <br />
          <p className="fw-bold fs-3">Các khóa học bán chạy</p>
          <br />
          <div className="row ">
            {topSoldCourses.map((course) => (
              <div className="card mx-1 py-2 my-2" style={{ width: "22%" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CourseCard key={course.Id} course={course} />
                </div>
              </div>
            ))}
          </div>

          <br />
          <p className="fw-bold fs-3">Các khóa học được đánh giá cao</p>
          <br />
          <div className="row">
            {topRatingCourses.map((course) => (
              <div className="card mx-1 py-2 my-2" style={{ width: "22%" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CourseCard key={course.Id} course={course} />
                </div>
              </div>
            ))}
          </div>

          <br />
          <p className="fw-bold fs-3">Khóa học mới ra mắt</p>
          <br />
          <div className="row">
            {topNewCourses.map((course) => (
              <div className="card mx-1 py-2 my-2" style={{ width: "22%" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CourseCard key={course.Id} course={course} />
                </div>
              </div>
            ))}
          </div>

          <br />
          {courseProposal.length > 0 && (
            <p className="fw-bold fs-3">Được đề xuất cho bạn</p>
          )}          
          <br />
          <div className="row">
            {courseProposal.map((course) => (
              <div className="card mx-1 py-2 my-2" style={{ width: "22%" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CourseCard key={course.Id} course={course} />
                </div>
              </div>
            ))}
          </div>  

          <br />
          <div className="text-center">
            <h3 className="fw-bold mb-0" style={{ marginBottom: "0px" }}>
              Bạn chưa tìm thấy khóa học mình quan tâm?
            </h3>
            <br />
            <h3 className="fw-bold" style={{ marginTop: "-15px" }}>
              Edu123 có hơn hàng trăm khóa học chờ bạn khám phá
            </h3>
          </div>
          <br />
          <div className="row align-items-center justify-content-center">
            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faLanguage}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Ngoại ngữ</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faBullhorn}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Marketing</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faDesktop}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Tin học văn phòng</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faPencilRuler}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Thiết kế</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faUserGraduate}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Phát triển bản thân</div>
            </div>
          </div>
          <br />
          <div className="row align-items-center justify-content-center">
            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faShoppingCart}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Sales,Bán hàng</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faCogs}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Cơ khí</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faLaptopCode}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Công nghệ thông tin</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faHeartbeat}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Sức khỏe</div>
            </div>

            <div
              className="card pt-0 pr-0 mx-3 p-0 d-flex align-items-center justify-content-center"
              style={{
                width: "12rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faLifeRing}
                size="2x"
                style={{ opacity: 0.5, padding: "5px" }}
              />
              <div>Phong cách sống</div>
            </div>
          </div>
          <br />
          <div className="row align-items-center justify-content-center">
            <div
              className="card d-flex flex-row align-items-center justify-content-center mx-3 p-0"
              style={{
                width: "50rem",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <img
                src={imageteacher}
                alt="Mô tả hình ảnh"
                style={{ width: "75%", height: "auto" }}
              />
              <div className="p-3 d-flex flex-column">
                <p>
                  Bạn muốn chia sẻ kiến thức mà mình có? Hãy đăng kí hợp tác với
                  chúng tôi ngay!
                </p>
                <button
                  type="button"
                  className="btn btn-primary mb-2"
                  onClick={() => navigate(`/user/register-teacher`)}
                >
                  Bắt đầu dạy học ngay hôm nay!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageCotent;
