import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axiosClient from "../../../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";

export default function NewVideo() {
  const [uploadMethod, setUploadMethod] = useState("file");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [videoData, setVideoData] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axiosClient.get(`videos/${id}`);
        const videoData = response.data;
        setVideoData(videoData);
        setVideoTitle(videoData.title);
        setShortDescription(videoData.description);
        if (uploadMethod === "youtube") {
          setYoutubeLink(videoData.video_filepath);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, [id]);

  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response1 = await axiosClient.get(
            `/courses/check/${videoData.courseId}/${userId}`
          );

          if (response1.data === true) {
            // Do something if registered
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

    if (videoData) {
      checkCourseRegister();
    }
  }, [videoData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      let videoUrl;
  
      if (uploadMethod === "file" && selectedVideo) {
        const formData = new FormData();
        formData.append("file", selectedVideo);
  
        const uploadResponse = await axiosClient.post("cloud/videos/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        videoUrl = uploadResponse.data.data;
      } else if (uploadMethod === "youtube" && youtubeLink.trim()) {
        // Validate YouTube link
        const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(youtubeLink)) {
          setFormError("Đường link YouTube không hợp lệ.");
          return;
        }
  
        videoUrl = youtubeLink;
      }
  
      if (!videoTitle.trim() || !shortDescription.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        return;
      }
  
      const maxCharLimit = 255;
      if (videoTitle.length > maxCharLimit || shortDescription.length > maxCharLimit) {
        setFormError(`Tiêu đề và mô tả ngắn không được quá ${maxCharLimit} ký tự.`);
        return;
      }
  
      const trimmedVideoTitle = videoTitle.trim();
      const trimmedShortDescription = shortDescription.trim();
  
      const patchData = {
        description: trimmedShortDescription,
        title: trimmedVideoTitle,
      };
  
      if (videoUrl !== null) {
        patchData.video_filepath = videoUrl;
      }
  
      const response = await axiosClient.patch(`/videos/${id}`, patchData);
  
      setSuccessMessage("Video đã được cập nhật thành công");
      setTimeout(() => {
        setSuccessMessage("");
      }, 15000);
      console.log(response.data);
    } catch (error) {
      console.error("Error creating course:", error);
      setFormError("Đã xảy ra lỗi khi tạo video");
      setTimeout(() => {
        setFormError("");
      }, 15000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
  };

  const handleFileChange = (e) => {
    setSelectedVideo(e.target.files[0]);
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-12 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <div className="container">
                  <h2 className="my-4">Chỉnh sửa video</h2>
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
                        Đang tải video, vui lòng đợi...
                      </div>
                    )}
                    {/* Choose upload method */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Chọn phương thức tải video:
                      </label>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="uploadFile"
                          name="uploadMethod"
                          className="form-check-input"
                          value="file"
                          checked={uploadMethod === "file"}
                          onChange={() => handleUploadMethodChange("file")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="uploadFile"
                        >
                          Tải video lên *
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="youtubeLink"
                          name="uploadMethod"
                          className="form-check-input"
                          value="youtube"
                          checked={uploadMethod === "youtube"}
                          onChange={() => handleUploadMethodChange("youtube")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="youtubeLink"
                        >
                          Nhập link YouTube (Bài giảng sẽ bị công khai cân nhắc trước khi chọn)
                        </label>
                      </div>
                    </div>

                    {/* Input based on the chosen method */}
                    {uploadMethod === "file" ? (
                      <div className="mb-3">
                        <label
                          htmlFor="uploadVideo"
                          className="form-label fw-bold"
                        >
                          Tải video lên
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="uploadVideo"
                          accept="video/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label
                          htmlFor="youtubeLink"
                          className="form-label fw-bold"
                        >
                          Nhập link YouTube *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="youtubeLink"
                          value={youtubeLink}
                          onChange={(e) => setYoutubeLink(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Tiêu đề video */}
                    <div className="mb-3">
                      <label
                        htmlFor="videoTitle"
                        className="form-label fw-bold"
                      >
                        Tiêu đề video *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="videoTitle"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                      />
                    </div>

                    {/* Mô tả ngắn */}
                    <div className="mb-3">
                      <label
                        htmlFor="shortDescription"
                        className="form-label fw-bold"
                      >
                        Mô tả *
                      </label>
                      <textarea
                        className="form-control"
                        id="shortDescription"
                        rows="2"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      {loading ? "Đang tải..." : "Cập nhật"}
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
