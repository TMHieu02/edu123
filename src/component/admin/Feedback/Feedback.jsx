import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faClose } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "../Course/manager-course.css";
import Pagination from "../../Others/Pagination";
import Modal from "react-modal";

export default function Feedback() {


  const [courses, setCourses] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  // Paging
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get(`/feedbacks`);
      const filteredCourses = response.data
        .sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt));
      setCourses(filteredCourses);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

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





  const [coursesSearch, setCoursesSearch] = useState([]);
  const [search, setSearch] = useState("");
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    const inputValue = e.target.value; // Lấy giá trị từ sự kiện onChange
    if (
      inputValue === null ||
      inputValue === undefined ||
      inputValue.trim() === ""
    ) {
      setIsShowResult(false);
    }
  };
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      if (search !== null && search !== undefined && search.trim() !== "") {
        const filteredUsers = courses.filter((user) => {
          const accountName = user?.title?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng     
          return (
            accountName.includes(search.toLowerCase())
          );
        });
        setIsLoading(false);
        setCoursesSearch(filteredUsers);
        setIsShowResult(true);
        if (filteredUsers.length === 0) {
          setNotification({
            type: "success",
            message:
              "Không tìm thấy người dùng với tên hoặc số tài khoản: " +
              search,
          });
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        } else {
          console.log("teacher result: ", filteredUsers);
          setNotification(null);
        }
      } else {
        setIsShowResult(false);
        setIsLoading(false);
        console.log("Error fetching users: Search is null or undefined");
      }

    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching users:", error);
    }
  };
  const [isShowResult, setIsShowResult] = useState(false);

  // modal show detail feedback
  const [modalOpen, setIsModalOpen] = useState(false);

  function openModalOpen() {
    setIsModalOpen(true);
  }
  function closeModalOpen() {
    setIsModalOpen(false);
  }

  // get details 

  const [feedback, setFeedback] = useState(null);
  const [user, setUser] = useState(null);
  // lấy thông tin của người dùng và feedback
  const getDetail = async (userID, feedbackID) => {
    try {

      const response = await axiosClient.get(`/feedbacks/${feedbackID}`);
      if (response.status === 200) {
        setFeedback(response.data);
        console.log('feedback data:', response.data);
      }
      const responseUser = await axiosClient.get(`/users/${userID}`);
      if (responseUser.status === 200) {
        setUser(responseUser.data);
        console.log('user data:', responseUser.data);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // xử lý hoàn thành feedback
  const handFeedback = async (feedbackID) => {
    try {
      const response = await axiosClient.delete(`/feedbacks/${feedbackID}`);
      if (response.status === 200) {
        fetchData();
        setNotification({
          type: "success",
          message:
            "Bạn đã đánh dấu thành công!"
        });
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        {/* Search bar */}
        <div className="row mb-4">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              onClick={() => {
                handleSearch();
              }}
            >
              Search
            </button>
          </div>
        </div>
        <div className="card mb-4">

          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-inline-block">Danh sách các báo cáo của người dùng</h5>

          </div>
          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Ngày gửi</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              {isLoading ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <tbody>
                  {isShowResult ? coursesSearch.slice(startIndex, endIndex).map((course, index) => (
                    <tr key={course.Id}>
                      <th scope="row">{index + 1}</th>
                      <td>{course.title}</td>
                      <td>{new Date(course.updateAt).toLocaleDateString("vi-VN")}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            getDetail(course.userId, course.Id);
                            openModalOpen()
                          }}
                        >
                          <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                        </button>
                        &nbsp;
                        <button
                          className='btn btn-sm btn-danger mx-1'

                        >
                          Khóa
                        </button>
                      </td>
                    </tr>
                  )) : courses.slice(startIndex, endIndex).map((course, index) => (
                    <tr key={course.Id}>
                      <th scope="row">{index + 1}</th>
                      <td>{course.title}</td>
                      <td>{new Date(course.updateAt).toLocaleDateString("vi-VN")}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            getDetail(course.userId, course.Id);
                            openModalOpen()
                          }}
                        >
                          <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                        </button>
                        &nbsp;
                        <button
                          className={`btn btn-sm ${course.isDeleted ? 'btn-success' : 'btn-secondary'} mx-1`}
                          disabled={course.isDeleted}
                          onClick={() => handFeedback(course.Id)}
                        >
                          {course.isDeleted ? 'Đã xử lý' : 'Xong'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
            <Pagination
              pageCount={Math.ceil((isShowResult
                ? coursesSearch.length
                : courses.length) / itemsPerPage)}
              handlePageClick={handlePageClick}
            />
          </div>
          {/* modal detail feedback */}
          <Modal
            isOpen={modalOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalOpen}
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
                Chi tiết
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalOpen} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "start",
                justifyContent: "start",
                width: '500px'
              }}
              className="py-2 my-2"
            >
              <p className="fw-bold">Tiêu đề:&nbsp;</p>
              <p>{feedback?.title}</p>
            </div>
            <div >
              {feedback?.image &&
                <>
                  <p className="fw-bold">Hình ảnh lỗi:</p>
                  <img src={feedback?.image} className="" alt="" style={{ width: '17vw', height: '18vh', objectFit: 'fill' }} />
                </>
              }
            </div>
            <p className="fw-bold">Nội dung: </p>
            <textarea
              type="text"
              className="form-control"
              name="contentRefuse"
              value={feedback?.content}
              rows="2"
              disabled
            />
            <div className="border p-2 mt-2">
              <p><span className="fw-bold">Tên người gửi:</span> {user?.fullname}</p>
              <p><span className="fw-bold">Email:</span> {user?.email}</p>
              <p><span className="fw-bold">Số điện thoại:</span> {user?.phone}</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "end",
                flexDirection: "row",
              }}
            >
              <button
                onClick={() => {
                  closeModalOpen();
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
        </div>
      </main>
    </div>
  );
}
