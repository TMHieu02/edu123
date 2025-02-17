import "../../../css/style.css";
import "../../../css/headers.css";
import Header from "../Header/Header";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import {
  faPlay,
  faPencilAlt,
  faTrash,
  faFile,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";

import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../Others/LoadingSpinner";
import Pagination from "../../Others/Pagination";
import StarRating from "./StarRating";

import "./review.css";

const CourseDetail = ({ courseDatas }) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/user/infor-teacher/${Id}`);
  };

  const { id } = useParams();

  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response = await axiosClient.get(
            `/courseRegisters/check/${userId}/${id}`
          );
          const response1 = await axiosClient.get(
            `/courses/check/${id}/${userId}`
          );
        
          if (response.data === true || response1.data === true) {
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

  const [teacherData, setTeacherData] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [videoData, setVideoData] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [ratingCount, setRatingCount] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [userRating, setUserRating] = useState(0);

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
  };

  const splitDescription = (description) =>
    description.split("**").map((part, index) => (
      <span key={index}>
        {part}
        {index < 2 && <br />}{" "}
      </span>
    ));

  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await axiosClient.get(`/courses/${id}`);
        setCourseData(courseResponse.data);

        const reviewResponse = await axiosClient.get(`/reviews/course=${id}`);
        setReviewData(reviewResponse.data);

        const videoResponse = await axiosClient.get(`/videos/course=${id}`);
        setVideoData(videoResponse.data);
        const documentResponse = await axiosClient.get(
          `/documents/course=${id}`
        );
        setDocumentData(documentResponse.data);

        const ratingCountResponse = await axiosClient.get(
          `/ratings/course/${id}/students/count`
        );
        const ratingCount = ratingCountResponse.data;
        setRatingCount(ratingCount);

        const studentCountResponse = await axiosClient.get(
          `/courseRegisters/course/${id}/students/count`
        );
        const studentCount = studentCountResponse.data;
        setStudentCount(studentCount);

        const userId = courseResponse.data.userId;
        const teacherResponse = await axiosClient.get(`/users/${userId}`);

        setTeacherData(teacherResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchRatingDistribution = async () => {
      try {
        const response = await axiosClient.get(
          `/ratings/course/${id}/distribution`
        );
        setRatingDistribution(response.data);
      } catch (error) {
        console.error("Error fetching rating distribution:", error);
      }
    };

    fetchRatingDistribution();
  }, [id]);

  if (!teacherData || !courseData || !reviewData) {
    return <LoadingSpinner />;
  }

  const { Id, fullname, description: teacherDescription, avatar } = teacherData;
  const { title, description, createAt, updateAt } = courseData;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleAddComment = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);
      const response = await axiosClient.post("/reviews", {
        courseId: id,
        userId: userId,
        content: commentInput,
      });

      const newComment = response.data;
      setReviewData([...reviewData, newComment]);
      setCommentInput("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId) => {
    setEditingCommentId(commentId);
    const commentToEdit = reviewData.find(
      (comment) => comment.reviewId === commentId
    );
    setEditedComment(commentToEdit.content);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const response = await axiosClient.patch(`/reviews/${commentId}`, {
        content: editedComment,
      });

      if (response.data) {
        const updatedReviewData = reviewData.map((comment) =>
          comment.reviewId === commentId
            ? { ...comment, content: editedComment }
            : comment
        );
        setReviewData(updatedReviewData);

        setEditingCommentId(null);
        setEditedComment("");
      } else {
        console.error("Failed to edit comment");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axiosClient.delete(`/reviews/${commentId}`);

      if (response.data === "Đánh dấu xóa thành công") {
        const updatedReviewData = reviewData.filter(
          (comment) => comment.reviewId !== commentId
        );
        setReviewData(updatedReviewData);
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div>
      <Header />
      <div data-bs-spy="scroll" data-bs-target="#goTop">
        <div id="topbar" style={{ background: "#0B3955" }}>
          <div className="container-fluid pt-5 ">
            <div className="row">
              <div className="col-sm-2"></div>
              <div className="col-sm-6 ">
                <h1 className="text-white">{title}</h1>
                <p className="text-white">
                  Ngày tạo khóa học : {formatDate(createAt)}
                </p>
                <p className="text-white">
                  Ngày cập nhật mới nhất : {formatDate(updateAt)}
                </p>
                <div className="d-inline-block">
                  <img
                    width="30"
                    height="30"
                    className="rounded-circle"
                    src={avatar}
                    alt=" "
                  />
                  <Link
                    to={`/user/info-teacher/${Id}`}
                    onClick={handleCourseClick}
                  >
                    {" "}
                    <span className="text-white">{fullname}</span>
                  </Link>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div className="d-inline-block text-white">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <span>{ratingCount} </span>Đánh giá
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div className="d-inline-block text-white">
                  <span>
                    <i className="fa fa-users" aria-hidden="true"></i>{" "}
                    {studentCount} Học viên{" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid pt-5 ">
        <div className="row">
          <div className="col-sm-2"></div>
          <div className="col-sm-6 ">
            <div className="bg-light bg-gradient card shadow mb-3">
              <div className="container"></div>
            </div>
            <br />
            <div className="bg-light bg-gradient navbar navbar-expand card shadow mb-3 ">
              <div className="container-fluid ">
                <ul className="navbar-nav ms-5">
                  <li className="nav-item fw-bold ">
                    <a className="nav-link text-link" href="#gioithieu">
                      {" "}
                      Giới thiệu
                    </a>
                  </li>
                  <li className="nav-item fw-bold">
                    <a className="nav-link text-link" href="#noidung">
                      Nội dung khóa học
                    </a>
                  </li>
                  <li className="nav-item fw-bold">
                    <a className="nav-link text-link" href="#infogiangvien">
                      Thông tin giảng viên
                    </a>
                  </li>
                  <li className="nav-item fw-bold">
                    <a className="nav-link text-link" href="#danhgia">
                      Đánh giá
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <br />
            <div className="bg-light bg-gradient  card shadow mb-3 ">
              <h3>Giới thiệu khóa học</h3>
              <hr />
              <p style={{ whiteSpace: "pre-line" }}>{description}</p>
            </div>

            <br />

            <div className="bg-white" id="noidung">
              <h3 className="mb-4">Nội dung khóa học</h3>
              {videoData.map((video, index) => (
                <div key={video.Id} className="video-item mb-3">
                  <FontAwesomeIcon icon={faPlay} className="play-icon" />
                  <Link
                    to={`/user/course/watch-video/${video.Id}/${id}`}
                    className="video-link"
                    style={{
                      textDecoration: "none",
                      color: "black",
                      fontSize: "18px",
                    }} // Inline styles
                  >
                    &nbsp; Bài {index + 1}. {video.title}
                  </Link>
                  <div className="duration float-right">{video.duration}</div>
                  <hr className="mt-2 mb-2" />
                </div>
              ))}
            </div>

            <br />
            <div className="bg-white" id="noidung">
              <h3 className="mb-4">Tài liệu tham khảo</h3>
              <div className="documents-container">
                {documentData.map((document) => (
                  <div key={document.Id} className="document-item">
                    <div className="document-row">
                      <FontAwesomeIcon icon={faFile} className="file-icon" />

                      <span>
                        {" "}
                        {document.title}
                        {": "}
                      </span>
                      <Link to={document.file_path} className="file-path" 
                        style={{
                          textDecoration: "none",
                          color: "black",
                          fontSize: "18px",
                        }} 
                      >
                        {document.file_path}
                      </Link>
                    </div>

                    <hr className="mt-2 mb-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white" id="infogiangvien">
              <h3>Thông tin giảng viên</h3>

              <div className="container">
                <div className="row">
                  <div className="col-sm-3">
                    <div>
                    <img
                        className="lazy"
                        width="150"
                        height="150"
                        src={avatar}
                        alt="Không có ảnh"
                        align=""
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="col-sm-8">
                    <p className="fw-bold">{fullname} </p>
                    <div className="pre">
                      {teacherDescription && (
                        <div className="pre">
                          {splitDescription(teacherDescription)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <br />

            <div className="bg-white" id="danhgia">
              <h3>Đánh giá của học viên</h3>
              <StarRating onRatingChange={handleRatingChange} courseId={id} />
              <hr />
              <div className="u-rate-f1">
  {Object.keys(ratingDistribution).map((rating) => (
    <div key={rating} className="u-rate-f1" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}> {/* Sử dụng Flexbox */}
      <div className="u-rate-f1-star" style={{ flex: 'none', fontSize: '15px' }}> {/* Cố định kích thước icon và text */}
        <span className="star-rate">
          <p className="star-rating-num">
            {rating}{" "}
            {Array.from({ length: 1 }, (_, i) => (
              <FontAwesomeIcon key={i} icon={faStar} style={{ fontSize: '15px' }} />
            ))}
          </p>
        </span>
      </div>
      <div className="u-rate-f1-progress" style={{ flex: 1, marginLeft: '10px', height: '15px' }}> {/* Linh động kích thước progress bar */}
        <div className="progress" style={{ height: '100%',width: '75%' }}>
          <div
            className="progress-bar progress-bar-success"
            role="progressbar"
            aria-valuenow={ratingDistribution[rating]}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ width: `${ratingDistribution[rating]}%`, height: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  ))}
</div>
            </div>

            <br />
            <div className="bg-white">
              <h3>Nhận xét của học viên</h3>
              <div>
                <div>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Nhập bình luận của bạn..."
                  />
                  <button onClick={handleAddComment}>Thêm bình luận</button>
                </div>
                <ul className="load_comment">
                  {reviewData.slice(startIndex, endIndex).map((review) => (
                    <li key={review.reviewId} className="u-block-cmhv">
                      <div className="block-hv">
                        <div className="cm-hv">
                          <div className="rate-hv">
                            <img
                              src={review.avatar}
                              alt="Avatar"
                              className="avatar"
                            />
                            <p>Người đăng: {review.fullname}</p>
                            <p>
                              Ngày bình luận:{" "}
                              {formatDate(
                                review.update !== review.create
                                  ? review.update
                                  : review.create
                              )}
                              {review.update !== review.create &&
                                " (Đã chỉnh sửa)"}
                            </p>

                            {editingCommentId === review.reviewId ? (
                              <div>
                                <textarea
                                  value={editedComment}
                                  onChange={(e) =>
                                    setEditedComment(e.target.value)
                                  }
                                />
                                <button
                                  onClick={() =>
                                    handleSaveEdit(review.reviewId)
                                  }
                                >
                                  Lưu chỉnh sửa
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p>{review.content}</p>
                                {parseInt(
                                  atob(localStorage.getItem("userId"))
                                ) === review.userId && (
                                  <div>
                                    <FontAwesomeIcon
                                      icon={faPencilAlt}
                                      onClick={() =>
                                        handleEditComment(review.reviewId)
                                      }
                                      className="edit-icon"
                                    />{" "}
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      onClick={() =>
                                        handleDeleteComment(review.reviewId)
                                      }
                                      className="delete-icon"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <Pagination
                pageCount={Math.ceil(reviewData.length / itemsPerPage)}
                handlePageClick={handlePageClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
