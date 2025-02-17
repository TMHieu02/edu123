import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import LoadingSpinner from "../../Others/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import ReactPlayer from "react-player";

import { Link } from "react-router-dom";
import {
  faTrash,
  faEdit,
  faPlus,
  faChevronDown,
  faVideo,
  faClose,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import YouTube from "react-youtube";
import axios from "axios";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = "AIzaSyBbpizSdL0PTidF7BiKa30GIqbCO0b8KpU"; // Thay thế bằng API Key của bạn
const youtubeAxios = axios.create({
  baseURL: BASE_URL,
});

export default function EditLession() {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  // section
  const [sectionData, setSectionData] = useState([]);
  const navigate = useNavigate();
  // modal
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [highIndexSection, setHighIndexSection] = useState("");
  const [modalNewSection, setIsModalNewSection] = useState(false);
  const [modalDeleteSection, setIsModalDeleteSection] = useState(false);
  const [modalEditSection, setIsModalEditSection] = useState(false);
  const [modalNewVideo, setIsModalNewVideo] = useState(false);
  //video
  const [highIndexVideo, setHighIndexVideo] = useState(0);
  const [videoID, setVideoID] = useState("");
  const [videoURL, setVideoURL] = useState("");
  // add video
  const [isDemo, setIsDemo] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  // delete video
  const [modalDeleteVideo, setIsModalDeleteVideo] = useState(false);
  // edit video
  const [modalEditVideo, setIsModalEditVideo] = useState(false);
  // show warning delete section have video
  const [modalWarningDelete, setIsModalWarningDelete] = useState(false);
  const [sectionID, setSectionID] = useState("");

  // duration
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(null);
  const [file_path, setFile_Path] = useState("");

  //duration new
  const [durationNew, setDurationNew] = useState(0);

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
      const [responseCourseInfo, responseCourseBenefit, responseVideo] =
        await Promise.all([
          axiosClient.get(`courses/${id}`),
          axiosClient.get(`course_overview/course=${id}`),
          axiosClient.get(`videos/course=${id}`),
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

      let properities =
        responseCourseInfo.status === 200 &&
        filteredDocuments.length > 0 &&
        responseVideo.data.length > 0;

      const courseInfo = responseCourseInfo.data;
      let no_request =
        courseInfo.isDeleted === true && courseInfo.active === false;
      let yes_request =
        courseInfo.isDeleted === false && courseInfo.active === false;
      let yes_public =
        courseInfo.isDeleted === false && courseInfo.active === true;

      if (properities) {
        if (no_request) {
          setIsRequest(true);
          setTextButtonRequest("Gửi yêu cầu");
        }
        if (yes_request) {
          setIsRequest(false);
          setTextButtonRequest("Đã gửi yêu cầu");
        }
        if (yes_public) {
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
  };

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
  };
  //

  const getVideoDetails = async (videoID) => {
    try {
      const response = await youtubeAxios.get(
        `/videos?id=${videoID}&part=contentDetails&key=${API_KEY}`
      );
      console.log("response api youtube: ", response.data);
      const isoDuration = response.data.items[0].contentDetails.duration;
      console.log(isoDuration);
      await convertISO8601ToSeconds(isoDuration);
    } catch (error) {
      console.error("Error fetching video details:", error);
    }
  };

  const convertISO8601ToSeconds = async (isoDuration) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);
    setDuration(hours * 3600 + minutes * 60 + seconds);
  };

  useEffect(() => {
    // const url =
    //   "https://www.youtube.com/watch?v=kRauptdx_Is&list=RDASZVVRY0cCI&index=3";
    const regex = /[?&]v=([^&]+)/;
    const match = youtubeLink.match(regex);
    const videoID = match && match[1];
    console.log(videoID);
    getVideoDetails(videoID);
  }, [youtubeLink]);

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
    const fetchDataSection = async () => {
      try {
        const response = await axiosClient.get(`/sections/course=${id}`, {});
        const sectionData = response.data
          .filter((item) => !item.isDeleted)
          .sort((a, b) => a.index - b.index)
          .map((item) => ({
            ...item,
            isShowVideo: true,
            highIndexVideo: 0,
            videos: [],
            isDelete: true,
          }));
        checkRequest();
        await Promise.all(sectionData.map(fetchAndUpdateVideos));
        const maxIndex =
          sectionData.length > 0
            ? sectionData[sectionData.length - 1].index
            : null;
        setHighIndexSection(maxIndex);
        console.log("Max Index: ", maxIndex);
        console.log("section Data: ", sectionData);
        setSectionData(sectionData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };

    fetchDataSection();
  }, [id]);

  if (!sectionData) {
    return <LoadingSpinner />;
  }
  const fetchAndUpdateVideos = async (section) => {
    try {
      const response = await axiosClient.get(
        `/videos/course=${id}/section=${section.Id}`
      );

      // Sắp xếp các phần tử trong response.data
      const sortedVideos = response.data.sort((a, b) => a.index - b.index);
      section.videos = sortedVideos;

      // Cập nhật highIndexVideo
      if (sortedVideos.length > 0) {
        section.highIndexVideo = sortedVideos[sortedVideos.length - 1].index;
        section.isDelete = false;
      }
    } catch (error) {
      console.error(`Error fetching videos for section ${section.Id}:`, error);
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

  function openModalNewSection() {
    setIsModalNewSection(true);
  }
  function closeModalNewSection() {
    setIsModalNewSection(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!content.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        return;
      }
      const maxCharLimit = 30;
      if (content.length > maxCharLimit) {
        setFormError(`Nội dung không được quá ${maxCharLimit} ký tự.`);
        return;
      }

      const trimInput = (value) => value.trim();

      console.log("high index: ", highIndexSection + 1);
      console.log("content: ", content);
      console.log("id", id);
      // const response = await axiosClient.post("/sections", {
      //   name: trimInput(content),
      //   index: highIndexSection + 1,
      //   courseId: 95,
      // });
      const response = await axiosClient.post("/sections", {
        name: trimInput(content),
        index: highIndexSection + 1,
        courseId: id,
      });
      console.log("response: ", response.data);

      setSuccessMessage("Nội dung đã được tải lên thành công");
      setFormError("");
      const newSection = {
        name: response.data.name,
        index: response.data.index,
        courseId: response.data.courseId,
        isDeleted: response.data.isDeleted,
        Id: response.data.id,
        createAt: response.data.createAt,
        updateAt: response.data.updateAt,
        isShowVideo: false,
        videos: [],
      };

      setSectionData((prevSectionData) => [...prevSectionData, newSection]);
      checkRequest();
      setHighIndexSection(response.data.index);
      console.log("high index: ", response.data.index);
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

  function openModalDeleteSection() {
    setIsModalDeleteSection(true);
  }
  function closeModalDeleteSection() {
    setIsModalDeleteSection(false);
  }

  const handleDeleteSection = async () => {
    try {
      const response = await axiosClient.delete(`/sections/${sectionID}`);
      console.log(response.data);

      setSectionData((prevSectionData) => {
        const updatedSectionData = prevSectionData.filter(
          (section) => section.Id !== sectionID
        );
        if (updatedSectionData.length > 0) {
          console.log(
            "Index of the last element after deletion:",
            updatedSectionData[updatedSectionData.length - 1].index
          );
          setHighIndexSection(
            updatedSectionData[updatedSectionData.length - 1].index
          );
        } else {
          setHighIndexSection(0);
          console.log("No elements left in sectionData after deletion.");
        }
        return updatedSectionData;
      });
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
    }
  };

  function openModalEditSection() {
    setIsModalEditSection(true);
  }
  function closeModalEditSection() {
    setIsModalEditSection(false);
  }
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!content.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        return;
      }
      const maxCharLimit = 30;
      if (content.length > maxCharLimit) {
        setFormError(
          `Tiêu đề và đường link không được quá ${maxCharLimit} ký tự.`
        );
        return;
      }

      const trimInput = (value) => value.trim();
      console.log("nội dung chỉnh sửa: ", trimInput(content));
      const response = await axiosClient.patch(`/sections/${sectionID}`, {
        name: trimInput(content),
      });
      console.log("response: ", response.data);
      setSectionData((prevSectionData) =>
        prevSectionData.map((section) =>
          section.Id === sectionID ? { ...section, name: content } : section
        )
      );
      setSuccessMessage("Nội dung đã được chỉnh sửa thành công");
      setFormError("");
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

  // add video
  function openModalNewVideo() {
    setIsModalNewVideo(true);
  }
  function closeModalNewVideo() {
    setIsModalNewVideo(false);
  }
  const handleSubmitAddVideo = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let videoUrl;

      if (uploadMethod === "file" && !selectedVideo) {
        setFormError("Vui lòng chọn video để tải lên.");
        setLoading(false);
        return;
      }

      if (uploadMethod === "gg" && !selectedVideo) {
        setFormError("Vui lòng chọn video để tải lên.");
        setLoading(false);
        return;
      }

      if (!videoTitle.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        setLoading(false);
        return;
      }

      const maxCharLimit = 255;
      if (
        videoTitle.length > maxCharLimit ||
        shortDescription.length > maxCharLimit
      ) {
        setFormError(
          `Tiêu đề và mô tả ngắn không được quá ${maxCharLimit} ký tự.`
        );
        setLoading(false);
        return;
      }
      let hours_post = 0;
      let minutes_post = 0;
      let seconds_post = 30;
      if (uploadMethod === "file") {
        const formData = new FormData();
        formData.append("file", selectedVideo);
        console.log("selected video: ", selectedVideo);
        const uploadResponse = await axiosClient.post(
          `cloud/videos/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("response api selected: ", uploadResponse.data);
        videoUrl = uploadResponse.data.data;
        const responseVideo = await axiosClient.get(
          `/cloud/video/info?videoUrl=${videoUrl}`
        );
        const timeString = responseVideo.data.data;
        // Tách chuỗi thành các phần tử giờ, phút, giây
        const [hoursStr, minutesStr, secondsStr] = timeString.split(":");

        // Chuyển các phần tử thành số nguyên
        hours_post = parseInt(hoursStr, 10);
        minutes_post = parseInt(minutesStr, 10);
        seconds_post = parseInt(secondsStr, 10);

        setVideoURL(videoUrl);
      } else {
        const formData = new FormData();
        formData.append("file", selectedVideo);

        console.log("selected video: ", selectedVideo);

        try {
          const uploadResponse = await axiosClient.post(
            "googledrive/uploadFile",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("link gg ", uploadResponse.data.url);

          const covertlink = await axiosClient.get("googledrive/convertLink", {
            params: { link: uploadResponse.data.url },
          });

          console.log("link covert ", covertlink.data);

          videoUrl = covertlink.data;
          setVideoURL(videoUrl);
        } catch (error) {
          console.error("Error during upload or conversion", error);
        }
      }

      const trimmedVideoTitle = videoTitle.trim();
      const trimmedShortDescription = shortDescription.trim();

      const response = await axiosClient.post("/videos", {
        video_filepath: videoUrl,
        description: trimmedShortDescription,
        title: trimmedVideoTitle,
        courseId: id,
        sectionId: sectionID,
        index: highIndexVideo + 1,
        isDemo: isDemo,
        hours: hours_post,
        minutes: minutes_post,
        seconds: seconds_post,
      });
      const newVideo =
        Array.isArray(response.data) && response.data.length > 0
          ? response.data[0]
          : null;
      console.log("new video", newVideo);
      setSectionData((prevSectionData) =>
        prevSectionData.map((section) => {
          if (section.Id === sectionID) {
            const updatedVideos = [...section.videos, newVideo];
            const updatedHighIndexVideo = newVideo.index;
            console.log("section id", section.Id);
            return {
              ...section,
              videos: updatedVideos,
              highIndexVideo: updatedHighIndexVideo,
              isDelete: false,
            };
          }
          return section;
        })
      );
      checkRequest();
      setSuccessMessage("Video đã được tạo thành công");
      setFormError("");
      setTimeout(() => {
        setSuccessMessage("");
      }, 15000);
      console.log(response.data);
    } catch (error) {
      console.error("Error creating video:", error);
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
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      // setVideoURL(fileURL);
    }
    setSelectedVideo(e.target.files[0]);
  };

  //delete video
  function openModalDeleteVideo() {
    setIsModalDeleteVideo(true);
  }
  function closeModalDeleteVideo() {
    setIsModalDeleteVideo(false);
  }
  const handleDeleteVideo = async () => {
    try {
      const response = await axiosClient.delete(`/videos/${videoID}`);
      console.log(response.data);

      setSectionData((prevSectionData) => {
        const updatedSectionData = prevSectionData.map((section) => {
          if (section.Id === sectionID) {
            // Tìm và xóa phần tử có videoId bằng videoID trong mảng videos
            const updatedVideos = section.videos.filter(
              (video) => video.videoId !== videoID
            );

            // Cập nhật highIndexVideo bằng index của phần tử cuối cùng trong mảng videos
            const highIndexVideo =
              updatedVideos.length > 0
                ? updatedVideos[updatedVideos.length - 1].index
                : 0;
            return {
              ...section,
              videos: updatedVideos,
              highIndexVideo: highIndexVideo,
              isDelete: updatedVideos > 0 ? false : true,
            };
          }
          return section;
        });
        return updatedSectionData;
      });
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
    }
  };

  //edit video
  function openModalEditVideo() {
    setIsModalEditVideo(true);
  }
  function closeModalEditVideo() {
    setIsModalEditVideo(false);
  }

  const handleSubmitEditVideo = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let videoUrl = videoURL;
      if (!videoURL) {
        if (uploadMethod === "file" && !selectedVideo) {
          setFormError("Vui lòng chọn video để tải lên.");
          setLoading(false);
          return;
        }

        if (uploadMethod === "gg" && !selectedVideo) {
          setFormError("Vui lòng chọn video để tải lên.");
          setLoading(false);
          return;
        }
      }

      if (!videoTitle.trim()) {
        setFormError("Vui lòng điền đầy đủ thông tin.");
        setLoading(false);
        return;
      }

      const maxCharLimit = 255;
      if (
        videoTitle.length > maxCharLimit ||
        shortDescription.length > maxCharLimit
      ) {
        setFormError(
          `Tiêu đề và mô tả ngắn không được quá ${maxCharLimit} ký tự.`
        );
        setLoading(false);
        return;
      }
      let hours_post = 0;
      let minutes_post = 0;
      let seconds_post = 30;
      if (uploadMethod === "file") {
        const formData = new FormData();
        formData.append("file", selectedVideo);
        console.log("selected video: ", selectedVideo);
        const uploadResponse = await axiosClient.post(
          `cloud/videos/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("response api selected: ", uploadResponse.data);

        videoUrl = uploadResponse.data.data;
        const responseVideo = await axiosClient.get(
          `/cloud/video/info?videoUrl=${videoUrl}`
        );
        const timeString = responseVideo.data.data;
        // Tách chuỗi thành các phần tử giờ, phút, giây
        const [hoursStr, minutesStr, secondsStr] = timeString.split(":");

        // Chuyển các phần tử thành số nguyên
        hours_post = parseInt(hoursStr, 10);
        minutes_post = parseInt(minutesStr, 10);
        seconds_post = parseInt(secondsStr, 10);
        setVideoURL(videoUrl);
      } else if (uploadMethod === "gg") {
        const formData = new FormData();
        formData.append("file", selectedVideo);

        console.log("selected video: ", selectedVideo);

        try {
          const uploadResponse = await axiosClient.post(
            "googledrive/uploadFile",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("link gg ", uploadResponse.data.url);

          const covertlink = await axiosClient.get("googledrive/convertLink", {
            params: { link: uploadResponse.data.url },
          });

          console.log("link covert ", covertlink.data);

          videoUrl = covertlink.data;
          setVideoURL(videoUrl);
        } catch (error) {
          console.error("Error during upload or conversion", error);
        }
      }

      const trimmedVideoTitle = videoTitle.trim();
      const trimmedShortDescription = shortDescription.trim();
      console.log(
        "thoi gian hàm edit, giờ: ",
        hours + " phút: " + minutes + " giây: " + seconds
      );

      const response = await axiosClient.patch(`/videos/${videoID}`, {
        video_filepath: videoUrl,
        description: trimmedShortDescription,
        title: trimmedVideoTitle,
        isDemo: isDemo,
        hours: hours_post,
        minutes: minutes_post,
        seconds: seconds_post,
      });
      const newVideo =
        Array.isArray(response.data) && response.data.length > 0
          ? response.data[0]
          : null;
      console.log("new video", newVideo);
      setSectionData((prevSectionData) =>
        prevSectionData.map((section) => {
          if (section.Id === sectionID) {
            const updatedVideos = section.videos.map((video) => {
              if (video.videoId === videoID) {
                return {
                  ...video,
                  video_filepath: videoUrl,
                  description: trimmedShortDescription,
                  title: trimmedVideoTitle,
                  isDemo: isDemo,
                  hours: hours,
                  minutes: minutes,
                  seconds: seconds,
                };
              }
              return video;
            });

            const updatedHighIndexVideo =
              updatedVideos.length > 0
                ? Math.max(...updatedVideos.map((video) => video.index))
                : 0;

            console.log("section id", section.Id);

            return {
              ...section,
              videos: updatedVideos,
              highIndexVideo: updatedHighIndexVideo,
            };
          }
          return section;
        })
      );

      setSuccessMessage("Video đã được cập nhật thành công");
      setFormError("");
      setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
      console.log(response.data);
    } catch (error) {
      console.error("Error creating video:", error);
      setFormError("Đã xảy ra lỗi khi tạo video");
      setTimeout(() => {
        setFormError("");
      }, 15000);
    } finally {
      setLoading(false);
    }
  };

  // thông báo là ko thể xóa được cái section khi đang có video bên trong
  //edit video
  function openModalWarningDelete() {
    setIsModalWarningDelete(true);
  }
  function closeModalWarningDelete() {
    setIsModalWarningDelete(false);
  }

  // handle video URL google driver
  const handleVideoURL = async (videoURL) => {
    let url;
    if (videoURL.includes("drive.google.com")) {
      // Chuyển đổi URL của Google Drive thành định dạng API
      const fileId = videoURL.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//); // Trích xuất fileId từ URL
      if (fileId) {
        url = `https://www.googleapis.com/drive/v3/files/${fileId[1]}?alt=media&key=AIzaSyAl0UBOkmbPeWjQSUu-KykYHiW0wdYHM70&v=.mp4`;
        setVideoURL(url);
      } else {
        setVideoURL(videoURL);
      }
    } else {
      setVideoURL(videoURL);
    }
  };

  const handleDuration = (duration) => {
    const roundedDuration = Math.floor(duration);
    setDurationNew(roundedDuration);

    const hrs = Math.floor(roundedDuration / 3600);
    const mins = Math.floor((roundedDuration % 3600) / 60);
    const secs = roundedDuration % 60;

    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-8 col-lg-8 mx-auto">
            <div className=" border-0 shadow rounded-3 my-5">
              <div className=" p-4 p-sm-5">
                <div className="container">
                  {/* Thẻ chứa hướng dẫn */}
                  <div className="mb-4">
                    <p className="fs-5 fw-bold">
                      Hướng dẫn: Tạo nội dung khóa học
                    </p>
                    <p>
                      "Tạo nội dung khóa học" là phần quan trọng giúp người học
                      hiểu rõ những kiến thức và kỹ năng họ sẽ nhận được từ khóa
                      học. Dưới đây là một số mẹo và ví dụ để giúp bạn xây dựng
                      nội dung khóa học hiệu quả:
                    </p>
                    <ul>
                      <li>
                        • <strong>Chia bài giảng thành các phần hợp lý</strong>:
                        Tổ chức nội dung khóa học thành các phần như Phần 1,
                        Phần 2, Phần 3, mỗi phần bao gồm một số bài học liên
                        quan để đảm bảo tính logic và dễ theo dõi.
                      </li>
                      <li>
                        • <strong>Tóm tắt nội dung từng phần</strong>: Đảm bảo
                        mỗi phần tóm tắt được các nội dung chính của các bài học
                        bên trong, giúp người học dễ dàng nắm bắt được cấu trúc
                        và mục tiêu của phần đó.
                      </li>
                      <li>
                        • <strong>Suy nghĩ kỹ về cách chia phần</strong>: Cân
                        nhắc các yếu tố như độ phức tạp, mức độ liên quan và
                        tính kế thừa giữa các phần để tạo nên một dòng chảy hợp
                        lý cho khóa học.
                      </li>
                      <li>
                        •{" "}
                        <strong>
                          Đảm bảo chất lượng nội dung từng bài giảng
                        </strong>
                        : Mỗi bài giảng nên thể hiện được một nội dung chất
                        lượng, rõ ràng và không lặp lại. Nội dung cần mới mẻ và
                        hấp dẫn để giữ chân người học.
                      </li>
                    </ul>
                    <p>
                      <strong>
                        Ví dụ về cách tạo nội dung trong 1 khóa học về giao tiếp
                      </strong>
                    </p>
                    <p className="py-1 my-1">Nội dung bài học:</p>
                    <ul>
                      <li>
                        <strong>Phần 1: Tư duy trong giao tiếp</strong>
                        <ul>
                          <li>Bài 1: Tại sao giao tiếp lại quan trọng?</li>
                          <li>
                            Bài 2: Nghệ thuật giao tiếp: Trời phú hay học tập?
                          </li>
                        </ul>
                      </li>
                      <li>
                        <strong>
                          Phần 2: Khởi đầu cho kỹ năng giao tiếp tốt
                        </strong>
                        <ul>
                          <li>Bài 3: Xác định mục tiêu giao tiếp</li>
                          <li>Bài 4: Kỹ năng lắng nghe</li>
                          <li>Bài 5: Kỹ năng đặt câu hỏi</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Phần 3: Nâng cao kỹ năng giao tiếp</strong>
                        <ul>
                          <li>Bài 6: Đọc hiểu ngôn ngữ cơ thể</li>
                          <li>Bài 7: Thuyết phục và tạo ảnh hưởng</li>
                          <li>Bài 8: Xử lý mâu thuẫn trong giao tiếp</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  {/* nội dung table */}
                  <div className="card mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 d-inline-block">Nội dung khóa học</h5>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: "green" }}
                        onClick={() => {
                          openModalNewSection();
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} /> Thêm phần
                      </button>
                    </div>
                    {notification && (
                      <div className={`notification ${notification.type}`}>
                        {notification.message}
                      </div>
                    )}

                    <div className="card-body">
                      {/* Danh sách tài liệu */}
                      {sectionData &&
                        sectionData.map((section, sectionIndex) => (
                          <div key={sectionIndex}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                padding: 5,
                                backgroundColor: "rgb(227, 243, 253)",
                              }}
                            >
                              <button
                                className="btn btn-light"
                                style={{
                                  backgroundColor: "rgb(227, 243, 253)",
                                  width: "90%",
                                  padding: 5,
                                  border: "none",
                                  textAlign: "left",
                                }}
                                onClick={() => {
                                  const updatedSectionData = [...sectionData];

                                  updatedSectionData[sectionIndex] = {
                                    ...section,
                                    isShowVideo: !section.isShowVideo,
                                  };

                                  setSectionData(updatedSectionData);
                                }}
                              >
                                <p
                                  className="py-0 my-0"
                                  style={{
                                    fontWeight: "bold",
                                    paddingLeft: 10,
                                    textAlign: "left",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span>
                                    <FontAwesomeIcon icon={faChevronDown} />{" "}
                                    Phần {sectionIndex + 1}. {section.name}{" "}
                                    {/* {section.isShowVideo
                                      ? "Hiển thị video"
                                      : "Ẩn video"} */}
                                  </span>
                                </p>
                                <p
                                  className="py-0 my-0"
                                  style={{
                                    textAlign: "left",
                                    paddingLeft: 15,
                                    fontSize: "14px",
                                  }}
                                >
                                  {/* {sectionInfo[sectionIndex]?.sumVideo} bài giảng */}
                                  {/* - {sectionInfo[sectionIndex]?.sumTime} phút */}
                                </p>
                              </button>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    setHighIndexVideo(section.highIndexVideo);
                                    setSectionID(section.Id);
                                    openModalNewVideo();
                                    setVideoTitle("");
                                    setYoutubeLink("");
                                    setVideoURL("");
                                    setShortDescription("");
                                    setSelectedVideo("");
                                    setSuccessMessage("");
                                    setFormError("");
                                  }}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    openModalEditSection();
                                    setSectionID(section.Id);
                                    setContent(section.name);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    if (section.isDelete) {
                                      openModalDeleteSection();
                                      setSectionID(section.Id);
                                    } else {
                                      console.log("Phải xóa video trước");
                                      openModalWarningDelete();
                                    }
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </div>

                            {section.isShowVideo.toString() === "true" &&
                              section.videos.length > 0 && (
                                <>
                                  {section.videos.map((video, index) => (
                                    <div key={index}>
                                      {/* Hiển thị thông tin của từng video */}
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "row",
                                          marginLeft: 5,
                                          paddingTop: 3,
                                          backgroundColor: "white",
                                        }}
                                      >
                                        <div
                                          style={{
                                            paddingLeft: 25,
                                            paddingTop: 0,
                                          }}
                                          onClick={() => {
                                            // if (
                                            //   video.indexArray !== lessionIndex
                                            // ) {
                                            //   // nếu như có thuộc tính video.isDemo thì hiển thị link và cho click vào
                                            // }
                                          }}
                                        >
                                          <p className="text-left pb-0 mb-0">
                                            {index + 1}. {video.title}{" "}
                                            <span className="small text-blue fw-bold">
                                              {video.isDemo ? "(demo)" : ""}
                                            </span>
                                          </p>
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "row",
                                              alignItems: "center",
                                              paddingTop: 0,
                                              paddingBottom: 0,
                                            }}
                                          >
                                            {video.hours !== 0 ? (
                                              <p
                                                style={{
                                                  fontSize: "14px",
                                                  paddingLeft: 5,
                                                  color: "gray",
                                                  paddingTop: 0,
                                                  marginTop: 0,
                                                  marginBottom: 0,
                                                  paddingBottom: 0,
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  icon={faVideo}
                                                  color="gray"
                                                />{" "}
                                                {video.hours} giờ{" "}
                                                {video.minutes} phút
                                              </p>
                                            ) : (
                                              <p
                                                style={{
                                                  fontSize: "14px",
                                                  paddingLeft: 5,
                                                  color: "gray",
                                                  paddingTop: 0,
                                                  marginTop: 0,
                                                  marginBottom: 0,
                                                  paddingBottom: 0,
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  icon={faVideo}
                                                  color="gray"
                                                />{" "}
                                                {video.minutes} phút{" "}
                                                {video.seconds} giây
                                              </p>
                                            )}
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <button
                                                className="btn btn-sm"
                                                onClick={() => {
                                                  openModalEditVideo();
                                                  setSectionID(section.Id);
                                                  setVideoID(video.videoId);
                                                  setVideoTitle(video.title);
                                                  setShortDescription(
                                                    video.description
                                                  );
                                                  handleUploadMethodChange(
                                                    "youtube"
                                                  );
                                                  setVideoURL(
                                                    video.video_filepath
                                                  );
                                                  setIsDemo(video.isDemo);
                                                  setFormError("");
                                                  setSuccessMessage("");
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  icon={faEdit}
                                                />
                                              </button>
                                              <button
                                                className="btn btn-sm"
                                                onClick={() => {
                                                  openModalDeleteVideo();
                                                  setVideoID(video.videoId);
                                                  setSectionID(section.Id);
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  icon={faTrash}
                                                />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <hr className="py-0 my-0" />
                                    </div>
                                  ))}
                                </>
                              )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {notification && (
                <div className={`notification ${notification.type}`}>
                  {notification.message}
                </div>
              )}
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
                    {isRequestCourseInfo ? (
                      <FontAwesomeIcon
                        icon={faCheckSquare}
                        color="gray"
                        size="lg"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faSquare} color="gray" size="lg" />
                    )}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-course/${id}`}
                      className="text-decoration-none text-dark"
                    >
                      Thông tin cơ bản (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                    {isRequestCourseBenefit ? (
                      <FontAwesomeIcon
                        icon={faCheckSquare}
                        color="gray"
                        size="lg"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faSquare} color="gray" size="lg" />
                    )}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-course-benefit/${id}`}
                      className="text-decoration-none  text-dark"
                    >
                      Tóm tắt nội dung của khóa học (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                    {isRequestVideo ? (
                      <FontAwesomeIcon
                        icon={faCheckSquare}
                        color="gray"
                        size="lg"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faSquare} color="gray" size="lg" />
                    )}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-lession/${id}`}
                      className="fw-bold text-decoration-none text-dark"
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
                  <button
                    className="btn btn-primary"
                    onClick={() => sendRequest()}
                    disabled={!isRequest}
                  >
                    <p className="fw-bold py-0 my-0">{textButtonRequest}</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* modal new section*/}
          <Modal
            isOpen={modalNewSection}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalNewSection}
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
                Thêm phần mới
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalNewSection} />
            </div>

            <div className="container" style={{ width: "500px" }}>
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
                    id="content"
                    rows="1"
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
          {/* modal delete section*/}
          <Modal
            isOpen={modalDeleteSection}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalDeleteSection}
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
              <FontAwesomeIcon
                icon={faClose}
                onClick={closeModalDeleteSection}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <p>Bạn có chắc chắc muốn xóa phần này không?</p>
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
                  closeModalDeleteSection();
                  handleDeleteSection();
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
                  closeModalDeleteSection();
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
          {/* modal edit section*/}
          <Modal
            isOpen={modalEditSection}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalEditSection}
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
                Chỉnh sửa phần
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalEditSection} />
            </div>

            <div className="container" style={{ width: "500px" }}>
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
                    Đang tạo nội dung, vui lòng đợi...
                  </div>
                )}

                {/* Nhập đường dẫn của tài liệu tham khảo */}
                <div className="mb-3">
                  <textarea
                    id="content"
                    rows="1"
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
          {/* modal new video*/}
          <Modal
            isOpen={modalNewVideo}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalNewVideo}
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
                Thêm video mới
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalNewVideo} />
            </div>

            <div className="container row" style={{ width: "1200px" }}>
              <div className="col-6">
                <form onSubmit={handleSubmitAddVideo}>
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

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Chọn phương thức tải video *
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
                      <label className="form-check-label" htmlFor="uploadFile">
                        <img
                          src="https://mms.businesswire.com/media/20231211533917/en/1965761/22/stacked_logo_blue.jpg"
                          alt="Cloudinary"
                          style={{
                            width: "75px",
                            height: "30px",
                            marginRight: "10px",
                          }}
                        />
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="uploadFile"
                        name="uploadMethod"
                        className="form-check-input"
                        value="gg"
                        checked={uploadMethod === "gg"}
                        onChange={() => handleUploadMethodChange("gg")}
                      />
                      <label className="form-check-label" htmlFor="uploadFile">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6ROFlzVl8dWnyxKVxDg_GLerFGjjs5-jtIke8hMGWsiNJIM8pmF6siuloE-kKXrlEuA&usqp=CAU"
                          alt="Google Driver"
                          style={{
                            width: "110px",
                            height: "30px",
                            marginRight: "10px",
                          }}
                        />
                      </label>
                    </div>
                  </div>

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
                  )}

                  <div className="mb-3">
                    <label htmlFor="videoTitle" className="form-label fw-bold">
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

                  <div className="mb-3">
                    <label
                      htmlFor="shortDescription"
                      className="form-label fw-bold"
                    >
                      Mô tả
                    </label>
                    <input
                      className="form-control"
                      id="shortDescription"
                      rows="2"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    ></input>
                  </div>
                  <div className="mb-3 form-check">
                    <label
                      className="form-check-label fw-bold"
                      htmlFor="demoCheckbox"
                    >
                      Demo
                    </label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="demoCheckbox"
                      checked={isDemo}
                      onChange={() => setIsDemo(!isDemo)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {loading ? "Đang tải..." : "Đăng"}
                  </button>
                </form>
              </div>
              {/* hiển thị video */}
              <div className="col-6">
                <div style={{ height: "50%", borderColor: "black" }}>
                  {/* Nội dung bên phải phía trên */}
                  {/* Nội dung bên phải phía trên */}
                  {/* <ReactPlayer url={videoURL} width='500px' height='250px' controls onDuration={handleDuration}  /> */}
                  <iframe
                    style={{ height: "100%", width: "100%" }}
                    src={videoURL}
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts"
                  ></iframe>
                  {/* <p>{videoURL}</p> */}
                  {/* <p>Thời lượng video: {durationNew} giây</p> */}
                </div>
              </div>
            </div>
          </Modal>
          {/* modal delete video*/}
          <Modal
            isOpen={modalDeleteVideo}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalDeleteVideo}
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
              <FontAwesomeIcon icon={faClose} onClick={closeModalDeleteVideo} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <p>Bạn có chắc chắc muốn xóa video này không?</p>
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
                  closeModalDeleteVideo();
                  handleDeleteVideo();
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
                  closeModalDeleteVideo();
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
          {/* modal edit video*/}
          <Modal
            isOpen={modalEditVideo}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalEditVideo}
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
                Chỉnh sửa video{/*  {sectionID} - {highIndexVideo} */}
              </h2>
              <FontAwesomeIcon icon={faClose} onClick={closeModalEditVideo} />
            </div>

            <div className="container row" style={{ width: "1200px" }}>
              <div className="col-6">
                <form onSubmit={handleSubmitEditVideo}>
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

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Chọn phương thức tải video *
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
                      <label className="form-check-label" htmlFor="uploadFile">
                        <img
                          src="https://mms.businesswire.com/media/20231211533917/en/1965761/22/stacked_logo_blue.jpg"
                          alt="Cloudinary"
                          style={{
                            width: "75px",
                            height: "30px",
                            marginRight: "10px",
                          }}
                        />
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="uploadFile"
                        name="uploadMethod"
                        className="form-check-input"
                        value="gg"
                        checked={uploadMethod === "gg"}
                        onChange={() => handleUploadMethodChange("gg")}
                      />
                      <label className="form-check-label" htmlFor="uploadFile">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6ROFlzVl8dWnyxKVxDg_GLerFGjjs5-jtIke8hMGWsiNJIM8pmF6siuloE-kKXrlEuA&usqp=CAU"
                          alt="Google Driver"
                          style={{
                            width: "110px",
                            height: "30px",
                            marginRight: "10px",
                          }}
                        />
                      </label>
                    </div>
                  </div>

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
                  )}

                  <div className="mb-3">
                    <label htmlFor="videoTitle" className="form-label fw-bold">
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

                  <div className="mb-3">
                    <label
                      htmlFor="shortDescription"
                      className="form-label fw-bold"
                    >
                      Mô tả *
                    </label>
                    <input
                      className="form-control"
                      id="shortDescription"
                      rows="2"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    ></input>
                  </div>
                  <div className="mb-3 form-check">
                    <label
                      className="form-check-label fw-bold"
                      htmlFor="demoCheckbox"
                    >
                      Demo
                    </label>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="demoCheckbox"
                      checked={isDemo}
                      onChange={() => setIsDemo(!isDemo)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {loading ? "Đang tải..." : "Đăng"}
                  </button>
                </form>
              </div>
              {/* hiển thị video */}
              <div className="col-6">
                <div
                  style={{ height: "50%", width: "50%", borderColor: "black" }}
                >
                  {/* Nội dung bên phải phía trên */}
                  {/* <ReactPlayer url={videoURL} width='500px' height='250px' controls onDuration={handleDuration}  /> */}
                  <iframe
                    style={{ height: "100%", width: "100%" }}
                    src={videoURL}
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts"
                  ></iframe>
                  {/* <p>{videoURL}</p> */}
                  {/* <p>Thời lượng video: {durationNew} giây</p> */}
                </div>
              </div>
            </div>
          </Modal>
          {/* modal delete video*/}
          <Modal
            isOpen={modalWarningDelete}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModalWarningDelete}
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
              <FontAwesomeIcon
                icon={faClose}
                onClick={closeModalWarningDelete}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <p>Hãy xóa hết các video có trong phần này trước khi xóa nó!</p>
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
                  closeModalWarningDelete();
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
            </div>z
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
}