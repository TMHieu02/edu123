import axiosClient from "../../../api/axiosClient";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClose,
  faPencil,
  faTrash,
  faChevronDown,
  faVideo,
  faCheckSquare,
  faSquare,
  faChevronUp,
  faTimes,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import ResultExam from "../../user/Exam/ResultExam";
import logo from "../../../assets/images/logo.png";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  function formatTimeAgo(timestamp) {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - timestamp;
    if (timeDiff < 0) {
      return "1 phút trước";
    }

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(months / 12);

    if (seconds < 60) {
      return seconds + " giây trước";
    } else if (minutes < 60) {
      return minutes + " phút trước";
    } else if (hours < 24) {
      return hours + " giờ trước";
    } else if (days < 7) {
      return days + " ngày trước";
    } else if (weeks < 4) {
      return weeks + " tuần trước";
    } else if (months < 12) {
      return months + " tháng trước";
    } else {
      return years + " năm trước";
    }
  }
  const [userID, setUserID] = useState();
  const getUserId = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      console.log("userID: ", userID);
      setUserID(userID);
      if (userID !== null) {
        // Dữ liệu đã tồn tại
        console.log("User id :", userID + " đã đăng nhập");
      } else {
        console.log("Chưa có tài khoản đăng nhập!");
      }
    } catch (e) {
      // Xử lý lỗi nếu có
      console.log("Lỗi khi lấy dữ liệu:", e);
    }
  };

  useEffect(() => {
    getUserId();
    loadLessionandCommentData();
    loadDocumentData();
    loadOverviewCourse();
    loadCourseBenifit();
    checkReview();
    loadReviewData();
    getUserAvatar();
  }, []);

  const [selectedOption, setSelectedOption] = useState("overview");
  // tài liệu
  const [documentData, setDocumentData] = useState([]);
  const loadDocumentData = async () => {
    try {
      setIsLoading(true);
      const documentResponse = await axiosClient.get(
        `/documents/course=${courseId}`
      );
      setIsLoading(false);
      setDocumentData(documentResponse.data);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const [overviewData, setOverviewData] = useState([]);
  const loadOverviewCourse = async () => {
    try {
      setIsLoading(true);
      const overviewResponse = await axiosClient.get(`/courses/${courseId}`);
      setIsLoading(false);
      setOverviewData(overviewResponse.data);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // đánh giá
  const [reviewData, setReviewData] = useState([]);
  const loadReviewData = async () => {
    try {
      const reviewResponse = await axiosClient.get(
        `/reviews/course=${courseId}`
      );
      const reviewData = reviewResponse.data;
      console.log(reviewData);
      setReviewData(reviewResponse.data);
      console.log("reviewData: ", reviewData);
    } catch (error) {
      setIsLoading(false);
    }
  };
  // modal add review
  let subtitle;
  const [modalAddReviewIsOpen, setIsModalAddReviewOpen] = useState(false);

  function openModalAddReview() {
    setIsModalAddReviewOpen(true);
  }
  function afterOpenModal() {
    subtitle.style.color = "#f00";
  }

  function closeModalAddReview() {
    setIsModalAddReviewOpen(false);
  }

  const [isReviewed, setIsReviewed] = useState(false);

  const checkReview = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      console.log("check");
      const response = await axiosClient.get(
        "/reviews/check/" + userID + "/" + courseId
      );
      const dataCheck = JSON.stringify(response.data);
      console.log("response check: " + dataCheck);
      const responseData = JSON.parse(dataCheck);

      // Truy cập vào thuộc tính courseId
      console.log("response courseId: " + responseData[0].courseId);
      if (responseData[0].courseId) {
        console.log("Đã review khóa học này rồi!");
        setIsReviewed(true);
      }
    } catch (error) {}
  };

  // lession and comment
  const [videoURL, setVideoURL] = useState("");
  const [titleVideo, setTitleVideo] = useState("");
  const [lessionData, setLessionData] = useState([]);
  const [videoID, setVideoID] = useState();
  // chỉ mục để tô màu video đang xem
  const [lessionIndex, setLessionIndex] = useState(0);
  const [sectionData, setSectionData] = useState([]);
  const loadLessionandCommentData = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      setIsLoading(true);
      const videoResponse = await axiosClient.get(
        `/videos/course=${courseId}/user=${userID}`
      );
      console.log("video response: ", videoResponse);
      setIsLoading(false);
      const videoList = videoResponse.data;
      const VideoData = videoList
        .filter((item) => !item.isDeleted)
        .sort((a, b) => a.index - b.index)
        .map((item, index) => ({
          ...item,
          indexArray: index, // Thêm thuộc tính indexArray tương ứng với index của mỗi phần tử
        }));
      setLessionData(VideoData);

      // load exam data
      const examResponse = await axiosClient.get(
        `/exams/course=${courseId}/user=${userID}`
      );
      const ExamData = examResponse.data
        .filter((item) => !item.isDeleted)
        .sort((a, b) => a.index - b.index);
      console.log("exam data: ", ExamData);
      setExamData(ExamData);

      // tìm chỉ số index của video viewed có index lớn nhất
      let maxViewedIndex = null; // Khởi tạo biến lưu trữ chỉ số của video `isViewed` lớn nhất

      VideoData.forEach((video, index) => {
        if (video.isViewed === true) {
          if (
            maxViewedIndex === null ||
            VideoData[maxViewedIndex].index < video.index
          ) {
            maxViewedIndex = index; // Cập nhật chỉ số của video `isViewed` lớn nhất
          }
        }
      });

      // Nếu không tìm thấy phần tử có isViewed là true, trả về chỉ số của phần tử đầu tiên
      const resultIndex = maxViewedIndex !== null ? maxViewedIndex : 0;

      console.log("Chỉ số của phần tử có isViewed lớn nhất là:", resultIndex);
      setLessionIndex(resultIndex);

      //setVideoURL
      const processedLink = processVideoLink(
        VideoData[resultIndex].video_filepath
      );
      setVideoURL(processedLink);
      console.log(VideoData[resultIndex].video_filepath);
      //setTitleVideo
      setTitleVideo(VideoData[resultIndex].title);
      //cập nhật tiến độ
      trackProgress(videoList?.[resultIndex]?.videoId);

      // mảng góm nhóm các section
      // Khởi tạo một đối tượng bản đồ để lưu trữ các video theo sectionId
      const groupedVideos = {};

      // Lặp qua mỗi video trong danh sách videos
      VideoData.forEach((video) => {
        const { sectionIndex } = video; // trích xuất thuộc tính sectionId trong video
        // thuộc tính này chắc để
        // Nếu sectionId chưa tồn tại trong groupedVideos, khởi tạo một mảng rỗng
        if (!groupedVideos[sectionIndex]) {
          groupedVideos[sectionIndex] = {
            sectionId: video.sectionId,
            sectionName: video.sectionName,
            sectionIndex: video.sectionIndex,
            isShowVideo: false, // Thêm thuộc tính isShow với giá trị mặc định là false
            videos: [],
            exams: [],
          };
        }
        // nếu trong groupedVideo có cái video mà đã xem lớn nhất thì show view bên trong
        if (VideoData[resultIndex].videoId === video.videoId) {
          groupedVideos[sectionIndex].isShowVideo = true;
        }
        console.log("video: ", video);
        groupedVideos[sectionIndex].videos.push(video);
      });
      console.log("section data chưa có exam: ", Object.values(groupedVideos));
      if (groupedVideos && Object.keys(groupedVideos).length > 0) {
        console.log("có giá trị section nên map exam vào!");

        ExamData.forEach((exam) => {
          const { index } = exam; // trích xuất ra phần tử index của exam để lấy tương ứng với sectoion
          console.log("exam: ", exam);
          // console.log("group video index: ", groupedVideos);
          if (index != 0) {
            console.log(" index != 0");
            if (groupedVideos[index]) {
              console.log("group video index: ", groupedVideos[index]);
              console.log("có giá trị sectionId tương ứng với bài kiểm tra!");
              groupedVideos[index].exams.push(exam);
            } else {
              console.log(" ko có giá trị của index-1: ", index - 1);
            }
          } else {
            console.log(" index == 0");
          }
          // Nếu index chưa tồn tại trong groupedVideos, khởi tạo một mảng rỗng
          if (!groupedVideos[index]) {
            groupedVideos[index] = {
              // sectionId,
              sectionName: "Tổng kết",
              sectionIndex: index,
              isShowVideo: false, // Thêm thuộc tính isShow với giá trị mặc định là false
              videos: [],
              exams: [],
            };
            groupedVideos[index].exams.push(exam);
          }
        });
      } else {
        console.log("ko có giá trị section nên ko map exam vào!");
      }

      const sectionArray = Object.values(groupedVideos);

      // Sắp xếp mảng dựa trên sectionIndex
      sectionArray.sort((a, b) => a.sectionIndex - b.sectionIndex);

      // Gán mảng đã sắp xếp vào state
      setSectionData(sectionArray);
      console.log("section data: ", sectionArray);
      // console.log("section data: ", Object.values(groupedVideos));
      // Chuyển đổi object thành mảng và trả về kết quả
      setSectionData(Object.values(groupedVideos));
      // mảng chứa các thông tin section: tổng video, tổng video đã xem, thời gian
      const result = [];

      // Duyệt qua từng phần tử trong mảng sectionData
      Object.values(groupedVideos).forEach((section) => {
        // Tính tổng số video + exam
        const sumVideo = section.videos.length + section.exams.length;

        // tính tổng thời gian làm bài exam
        let sumTimeExam = 0;
        section.exams.forEach((exam) => {
          const timeString = exam.time;

          // Tách chuỗi thành giờ, phút và giây
          const [hour, minute, second] = timeString.split(":");

          // Chuyển đổi từ chuỗi sang số nguyên
          const hourInt = parseInt(hour);
          const minuteInt = parseInt(minute);

          // Tính tổng thời gian theo phút
          const totalMinutes = hourInt * 60 + minuteInt;
          sumTimeExam += totalMinutes;
        });

        // Tính tổng thời lượng video (đơn vị là phút)
        let sumTime = 0;
        section.videos.forEach((video) => {
          sumTime += video.hours * 60 + video.minutes;
        });
        sumTime += sumTimeExam;

        // Tính tổng số video đã xem + số bài kiểm tra đã làm
        const sumViewed =
          section.videos.filter((video) => video.isViewed).length +
          section.exams.filter((exam) => exam.isExam).length;

        // Thêm đối tượng mới vào mảng kết quả
        result.push({ sumVideo, sumTime, sumViewed });
      });

      // Kết quả là mảng các đối tượng chứa các thuộc tính sumVideo, sumTime, sumViewed
      console.log(result);
      setSectionInfo(result);

      // mảng để hiển thị đánh dấu video đã học
      const progressVideo = videoList.map((video) => video.isViewed);
      console.log("progress Video", progressVideo);
      progressVideo[0] = true;
      setProgressVideo(progressVideo);
      //loadCommentData
      const firstLessionID = videoList?.[resultIndex]?.videoId;
      console.log(firstLessionID);
      setVideoID(firstLessionID);
      loadCommentData(firstLessionID);
    } catch (error) {
      setIsLoading(false);
    }
  };
  // thông tin của cái section: tổng số video đã học/ tổng video, tổng thời gian
  const [sectionInfo, setSectionInfo] = useState([]);

  // hàm xử lý chuyển đổi nếu nó là video youtube
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

  // cập nhật trạng thái học tập
  const [progressVideo, setProgressVideo] = useState([]);
  const trackProgress = async (videoID, index) => {
    console.log("trackingProgress");
    try {
      const userIdLocal = localStorage.getItem("userId");
      if (userIdLocal) {
        const userId = parseInt(atob(userIdLocal), 10);

        const responseTrackProgress = await axiosClient.post(
          "/learningprogress",
          {
            userId: userId,
            videoId: videoID,
          }
        );
        if (responseTrackProgress.status === 201) {
          console.log("tracking video thành công!");
        }
      } else {
      }
    } catch (error) {
      console.error("Error checking course and video registration:", error);
    }
  };

  // nút xem thêm
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // bạn sẽ học được
  const [courseBenefit, setCourseBenefit] = useState([]);
  const [leftColumnCB, setLeftColumnCB] = useState([]);
  const [rightColumnCB, setRightColumnCB] = useState([]);
  const loadCourseBenifit = async () => {
    try {
      const response = await axiosClient.get(
        `/course_overview/course=${courseId}`
      );
      const responseData = response.data;
      console.log(response.data);
      setCourseBenefit(response.data);
      const halfIndex = Math.ceil(responseData.length / 2);
      const leftColumn = responseData.slice(0, halfIndex);
      console.log("left column: ", leftColumn);
      setLeftColumnCB(leftColumn);
      const rightColumn = responseData.slice(halfIndex);
      console.log("right column: ", rightColumn);
      setRightColumnCB(rightColumn);
    } catch (error) {
      console.error("Error checking course and video registration:", error);
    }
  };

  // bình luận
  const [comments, setComments] = useState([]);
  const loadCommentData = async (videoID) => {
    try {
      const response = await axiosClient.get(`/comments/video=${videoID}`);
      const commentsData = response.data;

      // Lọc ra các comment chính
      const mainComments = commentsData.filter(
        (comment) => !comment.isDeleted && comment.parentCommentId === 0
      );

      // Tạo một đối tượng dạng map để lưu trữ các comment phản hồi theo commentId của chúng
      const repliesMap = commentsData.reduce((map, comment) => {
        if (!comment.isDeleted && comment.parentCommentId !== 0) {
          if (!map.has(comment.parentCommentId)) {
            map.set(comment.parentCommentId, []);
          }
          map.get(comment.parentCommentId).push(comment);
        }
        return map;
      }, new Map());

      // Thêm các comment phản hồi vào các comment chính tương ứng
      const commentsWithReplies = mainComments.map((mainComment) => ({
        ...mainComment,
        replies: [], // repliesMap.get(mainComment.commentId) || [], // Sử dụng replies từ map, nếu không có thì trả về mảng rỗng
        isCommentReply: repliesMap.get(mainComment.commentId) ? true : false,
        repliesLength: (repliesMap.get(mainComment.commentId) || []).length,
        showReplies: false, // Mặc định không hiển thị phản hồi
        showInputReply: false,
      }));

      setComments(commentsWithReplies);
      console.log("comment list: ", commentsWithReplies);
    } catch (error) {
      console.error("Error loading comment:", error);
    }
  };

  const [userAvatar, setUserAvatar] = useState("");

  const getUserAvatar = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      setIsLoading(true);
      const response = await axiosClient.get("/users/" + userID);
      setIsLoading(false);
      setUserAvatar(response.data.avatar);
    } catch (e) {
      console.log("Lỗi khi lấy dữ liệu hoặc không có thông tin người dùng!", e);
    }
  };

  // exam data
  const [examData, setExamData] = useState([]);

  // modal result-exam
  const [modalResultExam, setIsModalResultExam] = useState(false);

  function openModalResultExam(id) {
    setExamID(id);
    setIsModalResultExam(true);
  }

  function closeModalResultExam() {
    setIsModalResultExam(false);
    checkScoreExam();
  }

  const [examID, setExamID] = useState();
  const checkScoreExam = async () => {
    try {
      const userIdLocal = localStorage.getItem("userId");
      const userId = parseInt(atob(userIdLocal), 10);
      const response = await axiosClient.get(
        `/scores/check-score?userId=${userId}&examId=${examID}`
      );
      console.log("check score: ", response.data);
      if (response.data == true) {
        //
        trackExamProgress();
        updateProgressExam();
      }
    } catch (error) {
      console.error("Error loading comment:", error);
    }
  };

  const trackExamProgress = async () => {
    console.log("trackingProgress");
    try {
      const userIdLocal = localStorage.getItem("userId");
      if (userIdLocal) {
        const userId = parseInt(atob(userIdLocal), 10);
        // hàm này sẽ kiểm tra trong cái bảng score nếu có điểm số >= 8 thì thêm vào
        const responseTrackProgress = await axiosClient.post("/examprogress", {
          userId: userId,
          examId: examID,
        });
        if (responseTrackProgress.status === 201) {
          console.log("tracking exam thành công!");
        }
      } else {
      }
    } catch (error) {
      console.error("Error checking course and video registration:", error);
    }
  };
  const [sectionIndex, setSectionIndex] = useState();
  const [examIndex, setExamIndex] = useState();
  // cập nhật lại phần tử của video đã học thành true trên mảng hiển thị trạng thái
  const updateProgressExam = async () => {
    const updatedSectionData = [...sectionData];

    updatedSectionData[sectionIndex].exams[examIndex].isExam = true;
    // Cập nhật state mới với mảng sectionData đã được cập nhật
    setSectionData(updatedSectionData);
  };

  const [titleExam, setTitleExam] = useState("");

  return (
    <div>
      {/* header */}
      {/* <Header /> */}
      {/* title khóa học */}
      <header
        className="d-flex justify-content-left py-3 bg-white "
        id="topbar"
      >
        <div className="d-inline-block " style={{ paddingLeft: 50 }}>
          <Link to="/" style={{ display: "inline-block" }}>
            <img
              className="img-fluid logo"
              alt="logo"
              src={logo}
              style={{ display: "block" }}
            />
          </Link>
        </div>
        <p
          className="card-text"
          style={{ fontSize: "1.25em", fontWeight: "bold", paddingLeft: 25 }}
        >
          {overviewData.title}
        </p>
      </header>
      {/* content */}
      <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
        <div style={{ backgroundColor: "white", height: "100%", width: "75%" }}>
          <div style={{ height: "65%", backgroundColor: "black" }}>
            <iframe
              style={{ height: "100%", width: "100%" }}
              src={videoURL}
              allowFullScreen
              title={titleVideo}
            ></iframe>
          </div>
          <div style={{}}>
            {/* selected option */}
            <div className="flex-row pb-0 mb-0">
              <button
                className="btn"
                onClick={() => setSelectedOption("overview")}
              >
                <p
                  className="pb-0 mb-0"
                  style={{
                    fontWeight: "bold",
                    color: selectedOption === "overview" ? "black" : "gray",
                    fontSize: "1.125rem",
                    padding: 10,
                    ":hover": { color: "black" },
                  }}
                >
                  {" "}
                  Tổng quan
                </p>
                {selectedOption === "overview" && (
                  <hr
                    style={{
                      backgroundColor: "black",
                      width: "100%",
                      border: "none",
                      borderBottom: "2px solid black",
                      margin: 0,
                    }}
                  />
                )}
              </button>
              <button
                className="btn"
                onClick={() => setSelectedOption("description")}
              >
                <p
                  className="pb-0 mb-0"
                  style={{
                    fontWeight: "bold",
                    color: selectedOption === "description" ? "black" : "gray",
                    fontSize: "1.125rem",
                    padding: 10,
                    paddingLeft: 20,
                    paddingRight: 20,
                    ":hover": { color: "black" },
                  }}
                >
                  {" "}
                  Mô tả
                </p>
                {selectedOption === "description" && (
                  <hr
                    style={{
                      backgroundColor: "black",
                      width: "100%",
                      border: "none",
                      borderBottom: "2px solid black",
                      margin: 0,
                    }}
                  />
                )}
              </button>
              <button
                className="btn"
                onClick={() => setSelectedOption("document")}
              >
                <p
                  className="pb-0 mb-0"
                  style={{
                    fontWeight: "bold",
                    color: selectedOption === "document" ? "black" : "gray",
                    fontSize: "1.125rem",
                    padding: 10,
                    ":hover": { color: "black" },
                  }}
                >
                  {" "}
                  Tài liệu
                </p>
                {selectedOption === "document" && (
                  <hr
                    style={{
                      backgroundColor: "black",
                      width: "100%",
                      border: "none",
                      borderBottom: "2px solid black",
                      margin: 0,
                    }}
                  />
                )}
              </button>
            </div>

            <hr className="pt-0 mt-0" />
            {/* content selected option */}
            <div>
              <p>
                {/* overview */}
                {selectedOption === "overview" && (
                  <div>
                    <p
                      style={{
                        color: "black",
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        padding: 10,
                      }}
                    >
                      Giới thiệu về khóa học
                    </p>
                    <p style={{ padding: 10, fontWeight: "500" }}>
                      {overviewData.description}
                    </p>
                    <hr></hr>
                    <div style={{ padding: 10 }}>
                      {/* Số liệu */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <p style={{ marginRight: 10 }}>Theo số liệu</p>
                        <div style={{ marginLeft: 150 }}>
                          <p>Bài giảng: {overviewData.numberOfVideos}</p>
                          {overviewData.totalDuration && (
                            <p>
                              Video: Tổng số{" "}
                              {parseFloat(overviewData.totalDuration).toFixed(
                                2
                              )}{" "}
                              giờ
                            </p>
                          )}
                        </div>
                      </div>
                      <hr />
                      {/* Bạn sẽ học được */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <p style={{ marginRight: 10 }}>Bạn sẽ học được</p>
                        <div style={{ marginLeft: 105 }}>
                          <table>
                            <tbody>
                              {leftColumnCB.map((leftBenefit, index) => (
                                <tr key={index}>
                                  <td
                                    key={leftBenefit.Id}
                                    style={{
                                      maxWidth: "350px",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faCheck} />{" "}
                                    {leftBenefit.content}
                                  </td>
                                  {/* Kiểm tra xem phần tử tương ứng từ mảng rightColumnCB có tồn tại không */}
                                  {/* Nếu tồn tại, hiển thị nó */}
                                  {rightColumnCB[index] && (
                                    <td
                                      style={{
                                        maxWidth: "350px",
                                        wordWrap: "break-word",
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faCheck} />{" "}
                                      {rightColumnCB[index].content}
                                    </td>
                                  )}
                                  {/* Nếu không tồn tại, hiển thị ô trống */}
                                  {!rightColumnCB[index] && <td></td>}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <hr></hr>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <p style={{ padding: 10, flexShrink: 0 }}>Tóm tắt</p>
                      <div style={{ marginLeft: 180, marginRight: 110 }}>
                        {isExpanded ? (
                          <p>{overviewData.introduce}</p>
                        ) : (
                          overviewData.introduce && (
                            <p>{overviewData.introduce.slice(0, 500)}...</p>
                          )
                        )}
                        {!isExpanded ? (
                          <button
                            className="btn btn-link pt-0 mt-0"
                            onClick={handleToggleExpand}
                          >
                            Xem thêm
                          </button>
                        ) : (
                          <button
                            className="btn btn-link pt-0 mt-0"
                            onClick={handleToggleExpand}
                          >
                            Thu gọn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* description */}
                {selectedOption === "description" && (
                  <div>{lessionData?.[lessionIndex]?.description}</div>
                )}
                {/* document */}
                {selectedOption === "document" && (
                  <div>
                    {/* Hiển thị nội dung của tài liệu */}
                    {documentData.length > 0 ? (
                      documentData.map((document, index) => (
                        <div key={index}>
                          <div style={{ padding: 10 }}>
                            <div>
                              <p style={{ fontWeight: "bold", color: "black" }}>
                                {document.title}
                              </p>
                              <a
                                href={document.file_path}
                                target="_blank"
                                style={{
                                  textDecoration: "underline",
                                  color: "blue",
                                }}
                              >
                                {document.file_path}
                              </a>
                            </div>
                          </div>
                          <div className="border-b border-black w-full mt-1 mb-1 opacity-20" />
                        </div>
                      ))
                    ) : (
                      <p style={{ padding: 10 }}> Chưa có tài liệu nào. </p>
                    )}
                  </div>
                )}
              </p>
            </div>
          </div>
        </div>
        {/* lession list */}
        <div style={{ height: "100%", width: "25%" }}>
          <p style={{ fontWeight: "bold", padding: 20, fontSize: "18px" }}>
            Nội dung khóa học
          </p>
          <hr />
          {sectionData &&
            sectionData.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <button
                  className="btn btn-light"
                  style={{
                    backgroundColor: "rgb(227, 243, 253)",
                    width: "100%",
                    padding: 10,
                  }}
                  onClick={() => {
                    console.log("section DATA: ", sectionData);
                    // Toggle trạng thái mở rộng/collapse khi người dùng nhấp vào tiêu đề phần
                    // Tạo một bản sao của mảng sectionData để tránh thay đổi trực tiếp trên state
                    const updatedSectionData = [...sectionData];
                    // Toggle trạng thái isShowVideo của section tương ứng khi người dùng click
                    updatedSectionData[sectionIndex] = {
                      ...section,
                      isShowVideo: !section.isShowVideo,
                    };
                    // Cập nhật state mới với mảng sectionData đã được cập nhật
                    setSectionData(updatedSectionData);
                  }}
                >
                  <p
                    className="py-0 my-0"
                    style={{
                      fontWeight: "bold",
                      paddingLeft: 10,
                      textAlign: "left",
                    }}
                  >
                    <FontAwesomeIcon icon={faChevronDown} /> Phần{" "}
                    {sectionIndex + 1}. {section.sectionName}{" "}
                    {section.isShowVideo}{" "}
                  </p>
                  <p
                    className="py-0 my-0"
                    style={{
                      textAlign: "left",
                      paddingLeft: 15,
                      fontSize: "14px",
                    }}
                  >
                    {" "}
                    {sectionInfo[sectionIndex]?.sumVideo} bài giảng -{" "}
                    {sectionInfo[sectionIndex]?.sumTime} phút
                  </p>
                </button>
                {section.isShowVideo.toString() === "true" && (
                  <>
                    {section.videos.map((video, index) => (
                      <div key={index}>
                        {/* Hiển thị thông tin của từng video */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            marginLeft: 5,
                            paddingTop: 10,
                            backgroundColor:
                              video.indexArray === lessionIndex
                                ? "rgb(220, 220, 220)"
                                : "white",
                          }}
                        >
                          {progressVideo.length > 0 &&
                          progressVideo[video.indexArray] ? (
                            <div
                              style={{
                                display: "flex",
                                paddingRight: 10,
                                paddingLeft: 10,
                                opacity: "75%",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faSquare}
                                color="gray"
                                size="lg"
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                paddingRight: 10,
                                paddingLeft: 10,
                                opacity: "25%",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faSquare}
                                color="gray"
                                size="lg"
                              />
                            </div>
                          )}

                          <div
                            onClick={() => {
                              if (video.indexArray !== lessionIndex) {
                                setLessionIndex(video.indexArray); // để tô màu video đang xem
                                setTitleVideo(
                                  lessionData[video.indexArray].title
                                );
                                setVideoURL(
                                  processVideoLink(
                                    lessionData[video.indexArray].video_filepath
                                  )
                                );
                                setVideoID(video.videoId);
                                console.log(video.videoId);
                              }
                            }}
                          >
                            <p
                              className="py-0 my-0"
                              style={{ fontSize: "14px", textAlign: "left" }}
                            >
                              {index + 1}. {video.title}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <FontAwesomeIcon icon={faVideo} color="gray" />
                              {video.hours != 0 ? (
                                <p
                                  className="py-0 my-0"
                                  style={{
                                    fontSize: "14px",
                                    paddingLeft: 5,
                                    color: "gray",
                                  }}
                                >
                                  {" "}
                                  {video.hours} giờ {video.minutes} phút
                                </p>
                              ) : (
                                <p
                                  className="py-0 my-0"
                                  style={{
                                    fontSize: "14px",
                                    paddingLeft: 5,
                                    color: "gray",
                                  }}
                                >
                                  {" "}
                                  {video.minutes} phút
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {section.exams.map((exam, index) => (
                      <div key={index}>
                        {/* Hiển thị thông tin của từng exam */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            marginLeft: 5,
                            paddingTop: 10,
                            backgroundColor: "rgb(217, 238, 225)",
                          }}
                        >
                          {exam.isExam ? (
                            <div
                              style={{
                                display: "flex",
                                paddingRight: 10,
                                paddingLeft: 10,
                                opacity: "75%",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faCheckSquare}
                                color="gray"
                                size="lg"
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                paddingRight: 10,
                                paddingLeft: 10,
                                opacity: "25%",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faSquare}
                                color="gray"
                                size="lg"
                              />
                            </div>
                          )}

                          <div
                            onClick={() => {
                              setSectionIndex(sectionIndex);
                              setExamIndex(index);
                              // updateProgressExam(sectionIndex, index);
                              console.log("id exam: ", exam.id);
                              setTitleExam(exam.name);
                              openModalResultExam(exam.id);
                            }}
                          >
                            <p
                              className="py-0 my-0"
                              style={{ fontSize: "14px", textAlign: "left" }}
                            >
                              <span style={{ fontWeight: "bold" }}>
                                Kiểm tra
                              </span>{" "}
                              {exam.name}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <p
                                className="py-0 my-0"
                                style={{
                                  fontSize: "14px",
                                  paddingLeft: 5,
                                  color: "gray",
                                }}
                              >
                                Thời gian: {exam.time}{" "}
                              </p>
                              <p
                                className="py-0 my-0"
                                style={{
                                  fontSize: "14px",
                                  paddingLeft: 5,
                                  color: "gray",
                                }}
                              >
                                - {exam.count_question} câu hỏi
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* modal result exam */}
      <Modal
        isOpen={modalResultExam}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalResultExam}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: {
            top: "45%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            height: "85%",
            width: "90%",
            // maxWidth: "1200px",
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            border: "none",
          },
        }}
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
            {titleExam}
          </h2>
          <FontAwesomeIcon icon={faClose} onClick={closeModalResultExam} />
        </div>
        <div
          style={{
            backgroundColor: "",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 15,
          }}
        >
          <ResultExam id={examID} />
        </div>
      </Modal>
      {/* footer */}
    </div>
  );
};

export default CourseDetail;
