import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faClose, faCheckSquare, faSquare
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import axiosClient from "../../../api/axiosClient";

import { Link } from "react-router-dom";

export default function CourseBenefit() {
  const navigate = useNavigate();

  const { id } = useParams();
  const handleNavigate = (path) => {
    navigate(path);
  };

  const [documentData, setDocumentData] = useState([]);
  const [notification, setNotification] = useState(null);

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
    const fetchData = async () => {
      try {
        const response = await axiosClient.get(`/course_overview/course=${id}`, {});

        const filteredDocuments = response.data.filter(
          (document) => document.isDeleted !== true
        );
        checkRequest();
        // Sort documents by created_at from newest to oldest
        const sortedDocuments = filteredDocuments.sort((a, b) => {
          const dateA = new Date(a.createAt);
          const dateB = new Date(b.createAt);
          return dateB - dateA;
        });
        console.log('data: ', sortedDocuments);
        setDocumentData(sortedDocuments);
      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };

    fetchData();
  }, [id]);
  const [documentID, setDocumentID] = useState();
  const handleDeleteDocument = async () => {
    try {
      const response = await axiosClient.delete(`/course_overview/${documentID}`);
      console.log(response.data);

      const updatedDocuments = await axiosClient.get(`/course_overview/course=${id}`);
      const filteredDocuments = updatedDocuments.data.filter(
        (document) => document.isDeleted !== true
      );

      // Sort documents by created_at from newest to oldest
      const sortedDocuments = filteredDocuments.sort((a, b) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateB - dateA;
      });

      setDocumentData(sortedDocuments);
      checkRequest();
      setNotification({
        type: "success",
        message: "Document deleted successfully",
      });

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error deleting document:", error);
      setNotification({ type: "error", message: "Error deleting document" });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

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

  const [modalNew, setIsModalNew] = useState(false);

  function openModalNew() {
    setIsModalNew(true);
  }
  function closeModalNew() {
    setIsModalNew(false);
  }


 
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!content.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        return;
      }
      const maxCharLimit = 255;
      if (content.length > maxCharLimit) {
        setFormError(
          `Tiêu đề và đường link không được quá ${maxCharLimit} ký tự.`
        );
        return;
      }


      const trimInput = (value) => value.trim();

      const response = await axiosClient.post("/course_overview", {
        content: trimInput(content),
        index: 0,
        courseId: id,
      });

      setSuccessMessage("Nội dung đã được tải lên thành công");
      setFormError("");
      const updatedDocuments = await axiosClient.get(`/course_overview/course=${id}`);
      const filteredDocuments = updatedDocuments.data.filter(
        (document) => document.isDeleted !== true
      );
      checkRequest();
      // Sort documents by created_at from newest to oldest
      const sortedDocuments = filteredDocuments.sort((a, b) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateB - dateA;
      });

      setDocumentData(sortedDocuments);
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading document:", error);
      setFormError("Đã xảy ra lỗi khi tải lên");
      setTimeout(() => {
        setFormError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // edit tài liệu

  const [modalEdit, setIsModalEdit] = useState(false);
  const [contentEdit, setContentEdit] = useState("");
  function openModalEdit() {
    setIsModalEdit(true);
  }
  function closeModalEdit() {
    setIsModalEdit(false);
  }
  

  const loadDocumentEdit = async (documentID) => {
    try {
      const response = await axiosClient.get(`course_overview/${documentID}`);
      const videoData = response.data;
      setContentEdit(videoData.content);
      setFormError("");
      setSuccessMessage("");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!contentEdit.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        return;
      }
      const maxCharLimit = 255;
      if (contentEdit.length > maxCharLimit) {
        setFormError(
          `Tiêu đề và đường link không được quá ${maxCharLimit} ký tự.`
        );
        return;
      }


      const trimInput = (value) => value.trim();
      console.log('edit! ');
      console.log('id: ',documentID);
      const response = await axiosClient.patch(`/course_overview/${documentID}`, {
        content: trimInput(contentEdit),        
      });

      setSuccessMessage("Nội dung đã được cập nhật thành công!");
      setFormError("");
      const updatedDocuments = await axiosClient.get(`/course_overview/course=${id}`);
      const filteredDocuments = updatedDocuments.data.filter(
        (document) => document.isDeleted !== true
      );

      // Sort documents by created_at from newest to oldest
      const sortedDocuments = filteredDocuments.sort((a, b) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateB - dateA;
      });

      setDocumentData(sortedDocuments);
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading document:", error);
      setFormError("Đã xảy ra lỗi khi tải lên");
      setTimeout(() => {
        setFormError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

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
                  {/* List of documents */}
                  {/* Thẻ chứa hướng dẫn */}
                  <div className="mb-4">
                    <p className="fs-5 fw-bold">Hướng dẫn: Tóm tắt nội dung khóa học</p>
                    <p>"Tóm tắt nội dung khóa học" là phần quan trọng giúp người học hiểu rõ những kiến thức và kỹ năng họ sẽ nhận được từ khóa học. Dưới đây là một số mẹo và ví dụ để giúp bạn viết phần tóm tắt hiệu quả:</p>
                    <ul>
                      <li>• <strong>Rõ ràng và cụ thể</strong>: Mô tả chính xác những nội dung chính mà khóa học sẽ cung cấp. Tránh sử dụng ngôn ngữ mơ hồ hoặc quá chung chung.</li>
                      <li>• <strong>Nổi bật lợi ích và kỹ năng đạt được</strong>: Đảm bảo tóm tắt nêu rõ những lợi ích hoặc kỹ năng chính mà người học sẽ đạt được sau khi hoàn thành khóa học.</li>
                      <li>• <strong>Sử dụng ngôn ngữ tích cực và gợi cảm hứng</strong>: Viết một cách tích cực và tạo động lực để kích thích sự hứng thú của người học.</li>
                      <li>• <strong>Phù hợp với đối tượng mục tiêu</strong>: Đảm bảo nội dung tóm tắt phù hợp với đối tượng học viên mà bạn hướng đến.</li>
                      <li>• <strong>Nên có từ 3-8 nội dung tóm tắt</strong>: Giữ cho tóm tắt ngắn gọn và trọng tâm vào những điểm quan trọng nhất.</li>
                    </ul>
                    <p><strong>Ví dụ về Tóm tắt nội dung khóa học chơi Guitar</strong></p>
                    <p className="py-1 my-1">Nội dung bài học:</p>
                    <ul>
                      <li>✔ Kiến thức nhạc lý và các hợp âm guitar cơ bản nhất</li>
                      <li>✔ Nhanh chóng làm quen và thành thạo các điệu chơi guitar cơ bản một cách hiệu quả</li>
                      <li>✔ Có cái nhìn tổng quát nhất về Guitar đệm hát ngày nay</li>
                      <li>✔ Biết cách tự tạo động lực, đòn bẩy tự học guitar trong tương lai sau khi hoàn thành khóa học</li>
                      <li>✔ Thành thạo đệm hát 20+ bản nhạc mới và phổ biến ngày nay</li>
                      <li>✔ Có tư duy tốt để có thể tự soạn nhạc và tự đệm nhạc với những bài hát mới hơn, hot hơn</li>
                      <li>✔ Được định hướng phong cách chơi guitar và định hướng tương lai của người chơi guitar</li>
                    </ul>
                  </div>
                  <div className="card mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 d-inline-block">Tóm tắt nội dung khóa học</h5>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: "green" }}
                        onClick={openModalNew}
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
                      {documentData.map((document, index) => (
                        <div key={document.Id} className="mb-4">
                          <div className="row align-items-center">
                            <div className="col-lg-1 col-md-2 mb-4 mb-lg-0">
                                <strong>✔</strong>
                            </div>
                            <div className="col-lg-6 col-md-6 mb-4 mb-lg-0">
                              <div>
                                <p>{document.content}</p>
                              </div>
                            </div>
                            <div className="col-lg-5 col-md-4 mb-4 mb-lg-0 d-flex justify-content-end align-items-center">
                              <button
                                className="btn btn-primary btn-sm margin-button-header me-2"
                                onClick={() => {                                  
                                  loadDocumentEdit(document.Id);
                                  openModalEdit();
                                  setDocumentID(document.Id);
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm margin-button-header"
                                onClick={() => {
                                  openModalDelete();
                                  setDocumentID(document.Id);
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
                      className="fw-bold text-decoration-none  text-dark"
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
                      className=" text-decoration-none text-dark"
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
              <p>Bạn có chắc chắc muốn xóa đánh giá này không?</p>
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
          {/* modal new */}
          <Modal
            isOpen={modalNew}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalNew}
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
                Thêm nội dung mới
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalNew} />
            </div>

            <div className="container" style={{ width: '500px' }}>
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
                    Đang tạo nội dung, vui lòng đợi...
                  </div>
                )}

                {/* Nhập đường dẫn của tài liệu tham khảo */}
                <div className="mb-3">                  
                  <textarea
                        id="documentLink"
                        rows="4"
                        className="form-control"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      ></textarea>
                </div>
                

                <button type="submit" className="btn btn-primary">
                  {loading ? "Đang tải..." : "Tải lên"}
                </button>
              </form>
            </div>
          </Modal>
          {/* modal edit */}
          <Modal
            isOpen={modalEdit}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalEdit}
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
                Chỉnh sửa nội dung
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalEdit} />
            </div>

            <div className="container" style={{ width: '500px' }}>
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
                    Đang tạo tài liệu, vui lòng đợi...
                  </div>
                )}

                {/* Nhập đường dẫn của tài liệu tham khảo */}
                <div className="mb-3">                  
                  <textarea
                        id="documentLink"
                        rows="4"
                        className="form-control"
                        value={contentEdit}
                        onChange={(e) => setContentEdit(e.target.value)}
                      ></textarea>                  
                </div>                

                <button type="submit" className="btn btn-primary">
                  {loading ? "Đang tải..." : "Tải lên"}
                </button>
              </form>
            </div>
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
}
