import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faEdit, faTrash, faClose } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "../../../api/axiosClient";
import Pagination from "../../Others/Pagination";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Notification.css";

import LoadingSpinner from "../../Others/LoadingSpinner";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;
  // const currentCourses = courses.slice(offset, offset + itemsPerPage);

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const encodedId = localStorage.getItem("userId");
  const id = atob(encodedId);

  // modal
  let subtitle;
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
  function afterOpenModal() {
    subtitle.style.color = "#f00";
  }
  const [modalDelete, setIsModalDelete] = useState(false);

  function openModalDelete() {
    setIsModalDelete(true);
  }
  function closeModalDelete() {
    setIsModalDelete(false);
  }

  // id course delete 
  const [courseID, setCourseID] = useState('');
  
  const [courses, setCourses] = useState({
    publicCourses: [],
    unpublishedNotRequestedCourses: [],
    unpublishedRequestedCourses: [],
  });

  const [filter, setFilter] = useState("publicCourses");

  const currentCourses = courses[filter] || [];
  const fetchCourses = async () => {
    try {
      const response = await axiosClient.get(`/courses/user=${id}`);
      const coursesData = response.data;

      const publicCourses = coursesData.filter(
        (course) => course.active && !course.isDeleted && course.price != 0
      );
      const unpublishedNotRequestedCourses = coursesData.filter(
        (course) => !course.active && course.isDeleted && course.price != 0
      );
      const unpublishedRequestedCourses = coursesData.filter(
        (course) => !course.active && !course.isDeleted && course.price != 0
      );

      setCourses({
        publicCourses,
        unpublishedNotRequestedCourses,
        unpublishedRequestedCourses,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  useEffect(() => {
    

    fetchCourses();
  }, [id]);

  const handleDeleteCourse = async () => {
    try {      
      const response = await axiosClient.patch(`/courses/${courseID}`, {
        price: 0,
       });
      console.log(response.data);
      fetchCourses();
      setNotification({
        type: "success",
        message: "Course deleted successfully",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error deleting course:", error);
      setNotification({ type: "error", message: "Error deleting course" });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }



  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  

  const handleEditCourseClick = (iid) => {
    console.log(iid); // Check the value in the console
    navigate(`/teacher/course/edit-course/${iid}`);
  };

  
  return (
    <div>
      <Header />
      <div className="container d-flex justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card mb-4">
            <div className="card-header py-3 bg-light">
              <p className="mb-0 d-inline-block fs-4">Khóa học của tôi</p>
              {notification && (
                      <div className={`notification ${notification.type}`}>
                        {notification.message}
                      </div>
                    )}
              <button
                type="button"
                className="btn btn-primary btn-sm me-1 mb-2 d-inline-block float-end"
                data-mdb-toggle="tooltip"
                title="Remove item"
                onClick={() =>
                  handleNavigate("/teacher/course/new-course-process")
                }
              >
                <FontAwesomeIcon icon={faAdd}></FontAwesomeIcon>
              </button>
              <div className="d-flex mb-3 " style={{ width: "45%" }}>
                <label
                  htmlFor="courseFilter"
                  className="form-label fw-bold my-auto"
                >
                  Lọc:
                </label>
                <select
                  id="courseFilter"
                  className="form-select ms-2"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="publicCourses">Đã Public</option>
                  <option value="unpublishedNotRequestedCourses">
                    Chưa Public và Chưa Gửi Yêu Cầu
                  </option>
                  <option value="unpublishedRequestedCourses">
                    Chưa Public và Đã Gửi Yêu Cầu
                  </option>
                </select>
              </div>
            </div>
            <div className="card-body">
              {currentCourses.map((course, index) => (
                <div key={course.Id} className="row py-1 my-1">
                  <div className="col-lg-3 col-md-4 mb-2 py-1 my-1">
                    <img
                      src={course.image}
                      className="card-img-top image-course"
                      alt="Không có ảnh"
                      style={{ maxHeight: "75px", maxWidth: "75px" }}
                    />
                  </div>
                  <div className="col-lg-6 col-md-8 mb-2">
                    <p>
                      <strong>{course.title}</strong>
                    </p>
                    <div className="d-flex">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm me-1 mb-2"
                        data-mdb-toggle="tooltip"
                        title="Edit item"
                        onClick={() => handleEditCourseClick(course.course_id)}
                      >
                        <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                      </button>
                      {filter === "unpublishedNotRequestedCourses" && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm me-1 mb-2"
                          data-mdb-toggle="tooltip"
                          title="Remove item"
                          onClick={() => { setCourseID(course.course_id);openModalDelete()}}
                        >
                          <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                        </button>
                      )}
                    </div>
                  </div>
                  {index < currentCourses.length - 1 && (
                    <hr
                      className="my-1"
                      style={{ height: "2px", background: "#000" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>          
        </div>
      </div>
      {/* modal delete */}
      <Modal
            isOpen={modalDelete}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalDelete}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <h2
              style={{ fontWeight: "bold", color: "black", flex: "1" }}
              ref={(_subtitle) => (subtitle = _subtitle)}
            ></h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <h2
                style={{
                  fontWeight: "bold",
                  color: "black",
                  flex: "1",
                  fontSize: "1.25em",
                }}
              >
                Thông báo
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalDelete} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <p>Bạn có chắc chắc muốn xóa khóa học này không?</p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <button
                onClick={() => {
                  closeModalDelete();
                  handleDeleteCourse();
                }}
                style={{
                  width: "30%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "background-color 0.3s",
                }}
              >
                Xóa
              </button>
              <button
                onClick={() => {
                  closeModalDelete();
                }}
                style={{
                  marginLeft: 50,
                  width: "30%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "5px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "background-color 0.3s",
                }}
              >
                Thoát
              </button>
            </div>
          </Modal>        
      <Footer />
    </div>
  );
};

export default Dashboard;
