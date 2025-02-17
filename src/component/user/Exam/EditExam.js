import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useNavigate, useParams } from "react-router-dom";

export default function NewExam() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [examName, setExamName] = useState("");
  const [examStatus, setExamStatus] = useState(true);
  const [examHour, setExamHour] = useState("");
  const [examMinute, setExamMinute] = useState("");
  const [examSecond, setExamSecond] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const response2 = await axiosClient.get(`/exams/${id}`);
        const courseId = response2.data.courseId;
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response1 = await axiosClient.get(
            `/courses/check/${courseId}/${userId}`
          );

          if (response1.data === true) {
          } else {
            navigate("/user");
          }
        } else {
          navigate("/user");
        }
      } catch (error) {
        console.error("Error checking course register:", error);
      }
    };

    checkCourseRegister();
  }, [id, navigate]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axiosClient.get(`/exams/${id}`);
        const courseId = response.data.courseId;

        const responseCategories = await axiosClient.get(
          `/sections/course=${courseId}`
        );
        setCategories(responseCategories.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchExamData();
  }, [id]);

  const validateForm = () => {
    if (
      !examName ||
      !selectedCategory ||
      !examHour ||
      !examMinute ||
      !examSecond
    ) {
      setFormError("Vui lòng nhập đầy đủ thông tin cho tất cả các trường");
      return false;
    }

    setFormError("");
    return true;
  };

  const formatExamTime = () => {
    // Format giờ, phút, và giây thành "hh:mm:ss"
    const formattedTime = `${examHour}:${examMinute}:${examSecond}`;
    return formattedTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const trimInput = (value) => value.trim();

    try {
      setLoading(true);

      const response = await axiosClient.patch(`/exams/${id}`, {
        name: examName,
        status: examStatus,
        time: formatExamTime(),
      });
      console.log("exam", response.data);

      setSuccessMessage("Bài kiểm tra đã cập nhật thành công");
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axiosClient.get(`/exams/${id}`);
        const { name, status, courseId, time } = response.data;

        // Cập nhật các state với dữ liệu từ API
        setExamName(name);
        setExamStatus(status);
        setExamHour(getHoursFromTime(time)); // Lấy giờ từ thời gian
        setExamMinute(getMinutesFromTime(time)); // Lấy phút từ thời gian
        setExamSecond(getSecondsFromTime(time)); // Lấy giây từ thời gian
        setSelectedCategory(courseId);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      }
    };

    fetchExamData();
  }, [id]);

  // Hàm lấy giờ từ thời gian
  const getHoursFromTime = (timeString) => {
    const parts = timeString.split(":");
    return parts[0];
  };

  // Hàm lấy phút từ thời gian
  const getMinutesFromTime = (timeString) => {
    const parts = timeString.split(":");
    return parts[1];
  };

  // Hàm lấy giây từ thời gian
  const getSecondsFromTime = (timeString) => {
    const parts = timeString.split(":");
    return parts[2];
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-12 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5 fw-bold">
                  CẬP NHẬT BÀI KIỂM TRA
                </h2>

                <div className="container">
                  <form onSubmit={handleSubmit}>
                    {formError && (
                      <div className="alert alert-danger" role="alert">
                        {formError}
                      </div>
                    )}

                    {successMessage && (
                      <div className="alert alert-success" role="alert">
                        {successMessage}
                      </div>
                    )}

                    {loading && (
                      <div className="alert alert-info" role="alert">
                        Đang cập nhật bài kiểm tra, vui lòng đợi...
                      </div>
                    )}

                    <div className="row">
                      <div className="col-6 mb-3">
                        <label
                          htmlFor="examName"
                          className="form-label fw-bold"
                        >
                          Tên bài kiểm tra *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="examName"
                          value={examName}
                          maxLength={50}
                          onChange={(e) => setExamName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-3 mb-3">
                      <label htmlFor="category" className="form-label fw-bold">
                        Chuyên mục *
                      </label>
                      <select
                        className="form-select"
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="" disabled selected>
                          Chọn chuyên mục...
                        </option>
                        {categories.map((category) => (
                          <option key={category.Id} value={category.index}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-6 mb-3">
                        <label
                          htmlFor="examStatus"
                          className="form-label fw-bold"
                        >
                          Trạng thái *
                        </label>
                        <select
                          className="form-select"
                          id="examStatus"
                          value={examStatus}
                          onChange={(e) => setExamStatus(e.target.value)}
                        >
                          <option value={true}>Mở bài kiểm tra</option>
                          <option value={false}>Chờ chưa mở</option>
                        </select>
                      </div>

                      <div className="col-2 mb-3">
                        <label
                          htmlFor="examHour"
                          className="form-label fw-bold"
                        >
                          Giờ *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="examHour"
                          min="0"
                          max="23"
                          value={examHour}
                          onChange={(e) => setExamHour(e.target.value)}
                        />
                      </div>

                      <div className="col-2 mb-3">
                        <label
                          htmlFor="examMinute"
                          className="form-label fw-bold"
                        >
                          Phút *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="examMinute"
                          min="0"
                          max="59"
                          value={examMinute}
                          onChange={(e) => setExamMinute(e.target.value)}
                        />
                      </div>

                      <div className="col-2 mb-3">
                        <label
                          htmlFor="examSecond"
                          className="form-label fw-bold"
                        >
                          Giây *
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="examSecond"
                          min="0"
                          max="59"
                          value={examSecond}
                          onChange={(e) => setExamSecond(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      {loading ? "Đang tải..." : "Cập nhật bài kiểm tra"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
