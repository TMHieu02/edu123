import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./Video.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Pagination from "../../Others/Pagination";

export default function WatchVideo() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();


  const trackProgress = async () => {
    console.log("trackingProgress");
    try {
      const userIdLocal = localStorage.getItem("userId");
      if (userIdLocal) {
        const userId = parseInt(atob(userIdLocal), 10);
        console.log("Checking course registration for userId:", userId);
        console.log("Current id and courseId values:", id, courseId);
        
        const responseTrackProgress = await axiosClient.post("/learningprogress", {
          userId: 2,
          videoId: 41
        });
        if(responseTrackProgress.status === 201){
          console.log("tracking video thành công!");
        }
        
      } else {
  
        navigate("/user");
      }
    } catch (error) {
      console.error("Error checking course and video registration:", error);
    }
  }

  useEffect(() => {
    console.log("useEffect");
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          console.log("Checking course registration for userId:", userId);
          console.log("Current id and courseId values:", id, courseId);

          const courseRegisterResponse = await axiosClient.get(
            `/courseRegisters/check/${userId}/${id}`
          );
          const response1 = await axiosClient.get(
            `/courses/check/${id}/${userId}`
          );

          if (courseRegisterResponse.data === true || response1.data === true) {
            const videoResponse = await axiosClient.get(
              `/videos/check/${courseId}/${id}`
            );
  
            if (videoResponse.data === true) {
            } else {
              console.log(
                "Navigating to /user because videoResponse.data is not true"
              );
              navigate("/user");
            }
          } else {
            console.log(
              "Navigating to /user because courseRegisterResponse.data is not True"
            );
            navigate("/user");
          }
        } else {
    
          navigate("/user");
        }
      } catch (error) {
        console.error("Error checking course and video registration:", error);
      }
    };

    checkCourseRegister();
    trackProgress();
  }, [id, courseId, navigate]);
  useEffect(() => {
    trackProgress();
  },[id]);

  // State variables
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [lessons, setLessons] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");

  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    // Fetch video data
    const fetchVideoData = async () => {
      try {
        const response = await axiosClient.get(`videos/${courseId}`);
        const videoData = response.data;
        //tracking progress, chỗ này phải kiểm tra lại nữa 
        const responseTrackProgress = await axiosClient.post("/learningprogress", {
          userId: 2,
          videoId: videoData.Id
        });
        

        // Extract and set video details
        setTitle(videoData.title);
        setDescription(videoData.description);

        // Process video link
        const processedLink = processVideoLink(videoData.video_filepath);
        setLink(processedLink);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    // Fetch lessons data
    const fetchLessons = async () => {
      try {
        const response = await axiosClient.get(`/videos/course=${id}`);
        const lessonsData = response.data;

        const filteredLessons = lessonsData.filter((video) => !video.isDeleted);

        setLessons(filteredLessons);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    };

    // Fetch comments data
    const fetchComments = async () => {
      try {
        const response = await axiosClient.get(`/comments/video=${courseId}`);

        const commentsData = response.data;
        const filteredComment = commentsData.filter((comment) => !comment.isDeleted);
        setComments(filteredComment);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();

    fetchVideoData();
    fetchLessons();
  }, [id, courseId]);

  // Function to process video link
  const processVideoLink = (originalLink) => {
    if (originalLink.includes("youtube.com/watch?v=")) {
      const videoId = originalLink.split("v=")[1];
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    } else if (originalLink.includes("youtube.com/embed/")) {
      return originalLink;
    } else {
      return originalLink;
    }
  };

  const addNewComment = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);
     
      const response = await axiosClient.post("/comments", {
        videoId: courseId,
        userId: userId,
        content: newCommentText,
      });

      const newComment = response.data;
      setComments([...comments, newComment]);
      setNewCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = (commentId) => {
    setEditingCommentId(commentId);
    const commentToEdit = comments.find(
      (comment) => comment.commentId === commentId
    );
    setEditedComment(commentToEdit.content);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const response = await axiosClient.patch(`/comments/${commentId}`, {
        content: editedComment,
      });

      if (response.data) {
        const updatedComments = comments.map((comment) =>
comment.commentId === commentId
            ? { ...comment, content: editedComment }
            : comment
        );
        setComments(updatedComments);

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
      const response = await axiosClient.delete(`/comments/${commentId}`);

      if (response.data === "Đánh dấu xóa thành công") {
        const updatedComments = comments.filter(
          (comment) => comment.commentId !== commentId
        );
        setComments(updatedComments);
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          {/* Main video column */}
          <div className="col-sm-12 col-md-8 col-lg-8 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="my-4">Bài giảng: {title}</h2>
                <div className="embed-responsive embed-responsive-tall mb-4">
                  <iframe
                    className="embed-responsive-item"
                    src={link}
                    allowFullScreen
                    title={title}
                  ></iframe>
                </div>
                <h4 className="mb-3">Mô tả video</h4>
                <div style={{ backgroundColor: "lightgray", padding: "10px" }}>
                  <strong>
                    <p>{description}</p>
                  </strong>
                </div>

                {/* Comments Section */}
                <h4 className="my-4">Bình luận</h4>
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(event) => setNewCommentText(event.target.value)}
                  placeholder="Nhập bình luận của bạn..."
                />
                <button onClick={addNewComment}>Thêm bình luận</button>
                <ul className="load_comment">
                  {comments.slice(startIndex, endIndex).map((comment) => (
                    <li key={comment.commentId} className="u-block-cmhv">
                      <div className="block-hv">
                        <div className="cm-hv">
                          <div className="rate-hv">
                            <img
                              src={comment.avatar}
                              alt="Avatar"
                              className="avatar"
                            />
<p>Người đăng: {comment.fullname}</p>
                            <p>
                              Ngày bình luận:{" "}
                              {comment.update !== comment.create
                                ? formatDate(comment.update)
                                : formatDate(comment.create)}
                              {comment.update !== comment.create &&
                                " (đã chỉnh sửa)"}
                            </p>

                            {editingCommentId === comment.commentId ? (
                              <div>
                                <textarea
                                  value={editedComment}
                                  onChange={(e) =>
                                    setEditedComment(e.target.value)
                                  }
                                />
                                <button
                                  onClick={() =>
                                    handleSaveEdit(comment.commentId)
                                  }
                                >
                                  Lưu chỉnh sửa
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p>{comment.content}</p>
                                {parseInt(
                                  atob(localStorage.getItem("userId")),
                                  10
                                ) === comment.userId && (
                                  <div>
                                    <FontAwesomeIcon
                                      icon={faPencilAlt}
                                      onClick={() =>
                                        handleEditComment(comment.commentId)
                                      }
                                      className="edit-icon"
                                    />
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      onClick={() =>
                                        handleDeleteComment(comment.commentId)
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
                pageCount={Math.ceil(comments.length / itemsPerPage)}
                handlePageClick={handlePageClick}
              />
            </div>
          </div>

          <div className="col-sm-12 col-md-4 col-lg-4">
<div className="card border-0 shadow rounded-3 my-5">
              <div
                className="video-list"
                style={{ maxHeight: "100%", overflowY: "auto" }}
              >
                <h4 className="my-4">Bài học</h4>
                {lessons.map((lesson) => (
                  <div key={lesson.Id}>
                    <Link
                      to={`/user/course/watch-video/${lesson.Id}/${id}`}
                      className="video-link"
                    >
                      <p>{lesson.title}</p>
                    </Link>
                    <hr />
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