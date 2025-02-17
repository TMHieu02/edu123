import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faClose,
  faList,faCheckSquare, faSquare
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
export default function NewExam() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const encodedId = localStorage.getItem("userId");
  const userId = atob(encodedId);
  const [examName, setExamName] = useState("");
  const [examStatus, setExamStatus] = useState(false);
  const [examHour, setExamHour] = useState(0);
  const [examMinute, setExamMinute] = useState(0);
  const [examSecond, setExamSecond] = useState(0); // Thêm state cho giây
  const { id } = useParams();
  const [examData, setExamData] = useState([]);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`/exams/course=${id}`, {});

      const filteredDocuments = response.data.filter(
        (exam) => exam.isDeleted !== true
      );

      // Sort documents by created_at from newest to oldest
      const sortedDocuments = filteredDocuments.sort((a, b) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateB - dateA;
      });
      console.log("data: ", sortedDocuments);
      setExamData(sortedDocuments);
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    checkRequest();
  }, [id]);

  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response1 = await axiosClient.get(
            `/courses/check/${id}/${userId}`
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
    axiosClient
      .get(`/sections/course=${id}`)
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const validateForm = () => {
    if (
      !examName ||
      (!examHour && examHour !== 0) ||
      (!examMinute && examMinute !== 0) ||
      (!examSecond && examSecond !== 0) ||
      !selectedCategory
    ) {
      setFormError("Vui lòng nhập đầy đủ thông tin cho tất cả các trường");
      return false;
    }

    setFormError("");
    return true;
  };


  const extractTimeComponents = (formattedTime) => {
    // Tách chuỗi "hh:mm:ss" thành các phần tử giờ, phút, giây
    const [exam_hour, exam_minute, exam_second] = formattedTime.split(':');
    setExamHour(exam_hour);
    setExamMinute(exam_minute);
    setExamSecond(exam_second);
    // return { examHour, examMinute, examSecond };
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
      const response = await axiosClient.post("/exams", {
        name: trimInput(examName),
        index: parseInt(selectedCategory, 10),
        count_question: 0,
        status: false,
        courseId: id,
        time: formatExamTime(),
      });
      console.log("exam", response.data);

      setSuccessMessage("Bài kiểm tra đã được tạo thành công");
      fetchData();
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

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
  const [examID, setExamID] = useState("");
  //add exam
  const [modalAddExam, setIsModalAddExam] = useState(false);

  function openModalAddExam() {
    setIsModalAddExam(true);
  }
  function closeModalAddExam() {
    setIsModalAddExam(false);
  }

  //delete exam
  const [modalDeleteExam, setIsModalDeleteExam] = useState(false);

  function openModalDeleteExam() {
    setIsModalDeleteExam(true);
  }

  function closeModalDeleteExam() {
    setIsModalDeleteExam(false);
  }

  const handleDeleteDocument = async () => {
    try {
      const response = await axiosClient.delete(`/exams/${examID}`, {});
      if (response.status == 200) {
        setNotification({
          type: "success",
          message: "Bài kiểm tra đã xóa thành công!",
        });

        setTimeout(() => {
          setNotification(null);
        }, 5000);
        fetchData();
      }
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  };

  //edit exam
  const [modalEditExam, setIsModalEditExam] = useState(false);

  function openModalEditExam() {
    setIsModalEditExam(true);
  }

  function closeModalEditExam() {
    setIsModalEditExam(false);
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const trimInput = (value) => value.trim();

    try {
      setLoading(true);
      const response = await axiosClient.patch(`/exams/${examID}`, {
        name: trimInput(examName),
        index: parseInt(selectedCategory, 10),
        count_question: 0,
        status: examStatus,
        courseId: id,
        time: formatExamTime(),
      });
      console.log("exam", response.data);

      setSuccessMessage("Bài kiểm tra đã được cập nhật thành công");
      fetchData();
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  //
  //check các điều kiện gửi yêu cầu
  const [isRequest, setIsRequest] = useState(false);
  const [isRequestCourseInfo, setIsRequestCourseInfo] = useState(false);
  const [isRequestCourseBenefit, setIsRequestCourseBenefit] = useState(false);
  const [isRequestVideo, setIsRequestVideo] = useState(false);
  const [textButtonRequest, setTextButtonRequest] = useState("Gửi yêu cầu");
  const [lengthProperities, setLengthProperities] = useState(0);
  const checkRequest = async () => {
    try {
      // Sử dụng Promise.all để thực hiện các yêu cầu API đồng thời
      const [responseCourseInfo, responseCourseBenefit, responseVideo] = await Promise.all([
        axiosClient.get(`courses/${id}`),
        axiosClient.get(`course_overview/course=${id}`),
        axiosClient.get(`videos/course=${id}`)        
      ]);
      let length = 0;
      // Xử lý responseCourseInfo
      if (responseCourseInfo.status === 200) {
        setIsRequestCourseInfo(true);
        length += 1;
      } else {
        setIsRequestCourseInfo(false);
      }
      const filteredDocuments = responseCourseBenefit.data.filter(
        (document) => document.isDeleted !== true
      );
      // Xử lý responseCourseBenefit
      if (filteredDocuments.length > 0) {
        setIsRequestCourseBenefit(true);
        length += 1;
      } else {
        setIsRequestCourseBenefit(false);
      }
  
      // Xử lý responseVideo
      if (responseVideo.data.length > 0) {
        setIsRequestVideo(true);
        length += 1;
      } else {
        setIsRequestVideo(false);
      }
      setLengthProperities(length);
      // Kiểm tra tất cả các điều kiện và cập nhật isRequest
      
      let properities = responseCourseInfo.status === 200 && filteredDocuments.length > 0 && responseVideo.data.length > 0;
      
      const courseInfo = responseCourseInfo.data;
      let no_request = courseInfo.isDeleted === true && courseInfo.active === false;
      let yes_request = courseInfo.isDeleted === false && courseInfo.active === false;
      let yes_public = courseInfo.isDeleted === false && courseInfo.active === true;
      
      if (properities){
        if(no_request){
          setIsRequest(true);
          setTextButtonRequest("Gửi yêu cầu");
        }
        if(yes_request){
          setIsRequest(false);
          setTextButtonRequest("Đã gửi yêu cầu");
        }
        if(yes_public){
          setIsRequest(false);
          setTextButtonRequest("Đã public");
        }
      } else {
        setIsRequest(false);
        setTextButtonRequest("Gửi yêu cầu");
      }

      console.log("properities:", properities);
      console.log("no_request:", no_request);
      console.log("yes_request:", yes_request);
      console.log("yes_public:", yes_public);
      
    } catch (error) {
      console.error("Error fetching request data:", error);
    }
  }

  const sendRequest = async () => {
    try {
      
      setLoading(true);
      const response = await axiosClient.patch(`/courses/${id}`, {
        isDeleted: false,
      });
      if (response.status === 200) {
       checkRequest();
       setNotification({
        type: "success",
        message: "Bạn đã gửi yêu cầu thành công!",
       });       
   
       setTimeout(() => {
        setNotification(null);
       }, 5000);
      }
      setLoading(false);
     } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
      setNotification({ type: "error", message: "Lỗi!" });
      setTimeout(() => {
       setNotification(null);
      }, 5000);      
     }
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-8 col-lg-8 mx-auto">
            <div className=" border-0 shadow rounded-3 my-5">
              <div className=" p-4 p-sm-5">
                <div className="container">
                  {/* List of exams */}
                  <div className="card mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 d-inline-block">
                        Danh sách các bài kiểm tra
                      </h5>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: "green" }}
                        onClick={() => {
                          openModalAddExam();
                          setSuccessMessage("");
                          setFormError("");
                          setExamName("");
                          setSelectedCategory("");
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} /> Thêm
                      </button>
                    </div>
                    {notification && (
                      <div className={`notification ${notification.type}`}>
                        {notification.message}
                      </div>
                    )}

                    <div className="card-body">
                      {/* Danh sách tài liệu */}
                      {examData.map((exam, index) => (
                        <div key={exam.Id} className="mb-4">
                          <div className="row align-items-center">
                            <div className="col-lg-1 col-md-2 mb-4 mb-lg-0"></div>
                            <div className="col-lg-7 col-md-6 mb-4 mb-lg-0">
                              <div>
                                <p className="py-0 my-0">
                                  <strong>
                                    {index + 1}. {exam.name}
                                  </strong>{" "}
                                  &nbsp;{" "}
                                  <span className="small">
                                    {" "}
                                    ({exam.count_question} câu hỏi - {exam.time}{" "}
                                    ){" "}
                                  </span>
                                </p>
                                <p className="py-0 my-0 small ">
                                  {exam.status ? (
                                    <span className="text-primary fw-bold">
                                      Đang mở
                                    </span>
                                  ) : (
                                    <span className="fw-bold text-secondary">
                                      Đóng
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-4 mb-4 mb-lg-0 d-flex justify-content-end align-items-center">
                            <button
                                className="btn btn-primary btn-sm margin-button-header me-2"
                                onClick={() => {
                                  navigate(`/teacher/course/exam/${exam.Id}/question`,{ state: { name: exam.name } });
                                }}
                              >
                                <FontAwesomeIcon icon={faList} />
                              </button>
                              <button
                                className="btn btn-primary btn-sm margin-button-header me-2"
                                onClick={() => {
                                  openModalEditExam();
                                  setExamID(exam.Id);
                                  setSuccessMessage("");
                                  setFormError("");
                                  setExamName(exam.name);
                                  setSelectedCategory(exam.index);
                                  setExamStatus(exam.status);
                                  extractTimeComponents(exam.time);
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm margin-button-header"
                                onClick={() => {
                                  openModalDeleteExam();
                                  setExamID(exam.Id);
                                  setSuccessMessage("");
                                  setFormError("");
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                          <hr />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-4">
            {/* Thay đổi từ col-lg-3 thành col-lg-6 */}
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body">
                <h5 className="card-title text-center fw-bold">
                  Đã hoàn thành ({lengthProperities}/3)
                </h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item ">
                    {isRequestCourseInfo ? <FontAwesomeIcon
                      icon={faCheckSquare}
                      color="gray"
                      size="lg"
                    />: <FontAwesomeIcon
                    icon={faSquare}
                    color="gray"
                    size="lg"
                  />}
                    
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-course/${id}`}
                      className=" text-decoration-none text-dark"
                    >
                      Thông tin cơ bản (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                  {isRequestCourseBenefit ? <FontAwesomeIcon
                      icon={faCheckSquare}
                      color="gray"
                      size="lg"
                    />: <FontAwesomeIcon
                    icon={faSquare}
                    color="gray"
                    size="lg"
                  />}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-course-benefit/${id}`}
                      className="text-decoration-none  text-dark"
                    >
                      Tóm tắt nội dung của khóa học (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                  {isRequestVideo ? <FontAwesomeIcon
                      icon={faCheckSquare}
                      color="gray"
                      size="lg"
                    />: <FontAwesomeIcon
                    icon={faSquare}
                    color="gray"
                    size="lg"
                  />}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-lession/${id}`}
                      className=" text-decoration-none text-dark"
                    >
                      Danh sách bài học (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <FontAwesomeIcon icon={faSquare} color="white" size="lg" />
                    &nbsp;
                    <Link
                      to={`/teacher/course/new-exam/${id}`}
                      className="fw-bold text-decoration-none text-dark"
                    >
                      Bài kiểm tra
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <FontAwesomeIcon icon={faSquare} color="white" size="lg" />
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-document/${id}`}
                      className=" text-decoration-none text-dark"
                    >
                      Tài liệu
                    </Link>
                  </li>
                </ul>
                
                <div className="d-flex justify-content-center align-items-center">
                  <button className="btn btn-primary" onClick={()=> sendRequest()} disabled={!isRequest}>
                  <p className="fw-bold py-0 my-0">{textButtonRequest}</p>
                  </button>                  
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* modal new */}
        <Modal
          isOpen={modalAddExam}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModalAddExam}
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
              Thêm bài kiểm tra mới
            </h2>
            <FontAwesomeIcon icon={faClose} onClick={closeModalAddExam} />
          </div>

          <div className="container" style={{ width: "750px" }}>
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
                  Đang tạo bài kiểm tra, vui lòng đợi...
                </div>
              )}

              <div className="row">
                <div className="col-6 mb-3">
                  <label htmlFor="examName" className="form-label fw-bold">
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
                  Phần *
                </label>
                <select
                  className="form-select"
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled selected>
                    Chọn phần...
                  </option>
                  {categories.map((category, index) => (
                    <option key={category.Id} value={index+1}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row align-items-center">
                <p className="fw-bold">Thời gian làm bài:</p>
                <div className="col-4 mb-3 d-flex align-items-center">
                  <p className="me-2 mb-0">Giờ:</p>
                  <input
                    type="number"
                    className="form-control"
                    id="examHour"
                    min="0"
                    max="23"
                    placeholder="Giờ"
                    value={examHour}
                    onChange={(e) => setExamHour(e.target.value)}
                  />
                </div>

                <div className="col-4 mb-3 d-flex align-items-center">
                  <p className="me-2 mb-0">Phút:</p>
                  <input
                    type="number"
                    className="form-control"
                    id="examMinute"
                    placeholder="Phút"
                    min="0"
                    max="59"
                    value={examMinute}
                    onChange={(e) => setExamMinute(e.target.value)}
                  />
                </div>

                <div className="col-4 mb-3 d-flex align-items-center">
                  <p className="me-2 mb-0">Giây:</p>
                  <input
                    type="number"
                    className="form-control"
                    id="examSecond"
                    placeholder="Giây"
                    min="0"
                    max="59"
                    value={examSecond}
                    onChange={(e) => setExamSecond(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                {loading ? "Đang tải..." : "Tạo bài kiểm tra"}
              </button>
            </form>
          </div>
        </Modal>
        {/* modal delete */}
        <Modal
          isOpen={modalDeleteExam}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModalDeleteExam}
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
            <FontAwesomeIcon icon={faClose} onClick={closeModalDeleteExam} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <p>Bạn có chắc chắc muốn xóa bài kiểm tra này không?</p>
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
                closeModalDeleteExam();
                handleDeleteDocument();
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
                closeModalDeleteExam();
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
        {/* modal edit */}
        <Modal
          isOpen={modalEditExam}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModalEditExam}
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
              Chỉnh sửa bài kiểm tra
            </h2>
            <FontAwesomeIcon icon={faClose} onClick={closeModalEditExam} />
          </div>

          <div className="container" style={{ width: "450px" }}>
            <form onSubmit={handleSubmitEdit}>
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
                  Đang tạo bài kiểm tra, vui lòng đợi...
                </div>
              )}

              <div className="row">
                <div className="col-6 mb-3">
                  <label htmlFor="examName" className="form-label fw-bold">
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
                  Phần *
                </label>
                <select
                  className="form-select"
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled selected>
                    Chọn phần...
                  </option>
                  {categories.map((category, index) => (
                    <option key={category.Id} value={index+1}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row align-items-center">
                <p className="fw-bold">Thời gian làm bài:</p>
                <div className="col-4 mb-3 d-flex align-items-center">
                  <p className="me-2 mb-0">Giờ:</p>
                  <input
                    type="number"
                    className="form-control"
                    id="examHour"
                    min="0"
                    max="23"
                    placeholder="Giờ"
                    value={examHour}
                    onChange={(e) => setExamHour(e.target.value)}
                  />
                </div>

                <div className="col-4 mb-3 d-flex align-items-center">
                  <p className="me-2 mb-0">Phút:</p>
                  <input
                    type="number"
                    className="form-control"
                    id="examMinute"
                    placeholder="Phút"
                    min="0"
                    max="59"
                    value={examMinute}
                    onChange={(e) => setExamMinute(e.target.value)}
                  />
                </div>

                <div className="col-4 mb-3 d-flex align-items-center">
                  <p className="me-2 mb-0">Giây:</p>
                  <input
                    type="number"
                    className="form-control"
                    id="examSecond"
                    placeholder="Giây"
                    min="0"
                    max="59"
                    value={examSecond}
                    onChange={(e) => setExamSecond(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group py-3">
                <label className="fw-bold">Trạng thái bài kiểm tra:</label>
                <div>
                  <label className="me-3">
                    <input
                      type="radio"
                      value={true}
                      checked={examStatus === true}
                      onChange={() => setExamStatus(true)}
                    />
                    Mở bài kiểm tra
                  </label>
                  <label>
                    <input
                      type="radio"
                      value={false}
                      checked={examStatus === false}
                      onChange={() => setExamStatus(false)}
                    />
                    Đóng bài kiểm tra
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {loading ? "Đang tải..." : "Cập nhật bài kiểm tra"}
              </button>
            </form>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
}
