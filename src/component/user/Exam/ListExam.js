import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import EditCoursePanel from "../Panel/EditCoursePanel";
import LoadingSpinner from "../../Others/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import { faTrash, faEdit,  faEye } from "@fortawesome/free-solid-svg-icons";

export default function ListExam() {
  const { id } = useParams();
  const [examData, setExamData] = useState([]);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response1 = await axiosClient.get(
            `/courses/check/${id}/${userId}`
          );

          if (!response1.data) {
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
    const fetchData = async () => {
      try {
        const updatedCourses = await axiosClient.get(`/exams/course=${id}`);
        setExamData(updatedCourses.data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteCourse = async (examId) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this course?"
      );

      if (!isConfirmed) {
        return;
      }

      await axiosClient.delete(`/exams/${examId}`);
      const updatedCourses = await axiosClient.get(`/exams/course=${id}`);

      setExamData(updatedCourses.data);
      setNotification({
        type: "success",
        message: "Xóa bài kiểm tra thành công",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error deleting course:", error);
      setNotification({ type: "error", message: "Error deleting course" });
    }
  };

  if (!examData) {
    return <LoadingSpinner />;
  }

  

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-9">
            <div className="bg-white" id="noidung">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Danh sách các bài kiểm tra</h3>
                <button
                  className="btn btn-primary"
                  style={{ backgroundColor: "green" }}
                  onClick={() =>
                    handleNavigate(`/teacher/course/new-exam/${id}`)
                  }
                >
                  Thêm Bài Kiểm Tra
                </button>
              </div>
              {notification && (
                <div className={`notification ${notification.type}`}>
                  {notification.message}
                </div>
              )}
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên</th>
                    <th>Số câu hỏi</th>
                    <th>Trạng thái</th>
                    <th>Thời gian làm bài</th>
                    <th>Chỉnh sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {examData.map((exam, index) => (
                    <tr key={exam.Id}>
                      <td>{index + 1}</td>
                      <td
                        style={{
                          maxWidth: "100px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {exam.name}
                      </td>

                      <td>{exam.count_question}</td>
                      <td>{exam.status ? "Đang hoạt động" : "Đã khóa"}</td>
      

                      <td>{exam.time}</td>
                      <td>
                      <button className="btn btn-primary">
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ backgroundColor: "green" }}
                            onClick={() =>
                              handleNavigate(
                                `/teacher/course/exam/${exam.Id}/question`
                              ) 
                            }
                          />
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleNavigate(
                              `/teacher/course/edit-exam/${exam.Id}`
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteCourse(exam.Id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            <div className="bg-white" id="panel">
              <EditCoursePanel courseId={id} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
