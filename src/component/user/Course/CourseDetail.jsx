import "../../../css/style.css";
import "../../../css/headers.css";
import Header from "../Header/Header";
import CourseCard from "./CourseCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { faPlay, faStar, faCheck, faPencil, faTrash, faVideo, faBook, faClock, faCheckCircle, faClose, faUser, faCirclePlay, faChevronDown } from "@fortawesome/free-solid-svg-icons";

import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../../../api/axiosClient";

import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../Others/LoadingSpinner";
import Pagination from "../../Others/Pagination";
import Modal from 'react-modal';
import "./review.css";
import "./CourseDetail.css";
import { Editor } from "@tinymce/tinymce-react";

const CourseDetail = ({ courseDatas }) => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  // load overview course
  const [overviewData, setOverviewData] = useState([]);
  const loadOverviewTeacherReviewCourse = async () => {
    try {
      setIsLoading(true);
      const overviewResponse = await axiosClient.get(
        `/courses/${id}`
      );
      setOverviewData(overviewResponse.data);
      // teacher
      const userId = overviewResponse.data.userId;
      const teacherResponse = await axiosClient.get(`/users/${userId}`);
      setTeacherData(teacherResponse.data);
      const teacherProperitiesResponse = await axiosClient.get(`/courseRegisters/teacher/${userId}`);
      console.log('teacherProperities: ', teacherProperitiesResponse.data);
      setTeacherProperities(teacherProperitiesResponse.data);
      // review
      const reviewResponse = await axiosClient.get(`/reviews/course=${id}`);
      setReviewData(reviewResponse.data);
      // student count
      const studentCountResponse = await axiosClient.get(
        `/courseRegisters/course/${id}/students/count`
      );
      const studentCount = studentCountResponse.data;
      setStudentCount(studentCount);

      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
    }
  }

  // số học sinh đăng ký học
  const [studentCount, setStudentCount] = useState("");

  // ID người dùng
  const [userID, setUserID] = useState();
  const getUserId = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      console.log('userID: ', userID);
      setUserID(userID);
      if (userID !== null) {
        // Dữ liệu đã tồn tại
        console.log('User id :', userID + ' đã đăng nhập');
      } else {
        console.log('Chưa có tài khoản đăng nhập!');
      }
    } catch (e) {
      // Xử lý lỗi nếu có
      console.log('Lỗi khi lấy dữ liệu:', e);
    }
  };

  // bạn sẽ học được 
  const [courseBenefit, setCourseBenefit] = useState([]);
  const [leftColumnCB, setLeftColumnCB] = useState([]);
  const [rightColumnCB, setRightColumnCB] = useState([]);
  const loadCourseBenifit = async () => {
    try {
      const response = await axiosClient.get(`/course_overview/course=${id}`);
      const responseData = response.data;
      console.log(response.data);
      setCourseBenefit(response.data);
      const halfIndex = Math.ceil(responseData.length / 2);
      const leftColumn = responseData.slice(0, halfIndex);
      console.log('left column: ', leftColumn);
      setLeftColumnCB(leftColumn);
      const rightColumn = responseData.slice(halfIndex);
      console.log('right column: ', rightColumn);
      setRightColumnCB(rightColumn);
    } catch (error) {
      console.error("Error checking course and video registration:", error);
    }
  }

  // thông tin giảng viên
  const [teacherData, setTeacherData] = useState(null);

  // đánh giá
  const [reviewData, setReviewData] = useState([]);
  // các khóa học đề xuất
  const [courseProposal, setCourseProposal] = useState([]);
  const getCoursePropasal = async () => {
    try {
      const overviewResponse = await axiosClient.get(
        `/courses/${id}`
      );
      // đề xuất
      const userId = overviewResponse.data.userId;
      const response = await axiosClient.get(`/courses/proposal/teacher=${userId}`);

      if (response.data) {
        console.log('course propasal: ', response.data);
        setCourseProposal(response.data);
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error loading proposal course:", error);
    }
  }

  useEffect(() => {
    loadOverviewTeacherReviewCourse();
    loadCourseBenifit();
    loadLessionandCommentData();
    getUserId();
    checkReview();
    checkCourse();
    getCoursePropasal();
  }, [])

  // xem thêm mô tả giảng viên
  const [isExpandedTeacher, setIsExpandedTeacher] = useState(false);
  const containerRefTeacher = useRef(null);
  const handleToggleExpandTeacher = () => {
    setIsExpandedTeacher(!isExpandedTeacher);
    if (!isExpandedTeacher && containerRefTeacher.current) {
      containerRefTeacher.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // xem thêm mô tả khóa học
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // format thời gian đánh giá
  function formatTimeAgo(timestamp) {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - timestamp;
    if (timeDiff < 0) {
      return '1 phút trước';
    }

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(months / 12);

    if (seconds < 60) {
      return seconds + ' giây trước';
    } else if (minutes < 60) {
      return minutes + ' phút trước';
    } else if (hours < 24) {
      return hours + ' giờ trước';
    } else if (days < 7) {
      return days + ' ngày trước';
    } else if (weeks < 4) {
      return weeks + ' tuần trước';
    } else if (months < 12) {
      return months + ' tháng trước';
    } else {
      return years + ' năm trước';
    }
  }

  // format giá tiền
  const formatPrice = price => {
    if (typeof price !== 'string') {
      price = String(price);
    }

    if (price.startsWith('0')) {
      price = price.slice(1);
    }

    return price.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // fomart thời gian
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.toLocaleString('default', { month: 'numeric' });
    const year = date.getFullYear();
    return `${month}/${year}`;
  };


  // kiểm tra giỏ hàng, mua hàng và review
  const [isReviewed, setIsReviewed] = useState(false);
  const checkReview = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      if (userID) {
        console.log(userID);
        const response = await axiosClient.get('/reviews/check/' + userID + '/' + id);
        const dataCheck = JSON.stringify(response.data);
        console.log("response check: " + dataCheck);
        const responseData = JSON.parse(dataCheck);

        // Truy cập vào thuộc tính courseId
        console.log("response courseId: " + responseData[0].courseId);
        if (responseData[0].courseId) {
          console.log("Đã review khóa học này rồi!");
          setIsReviewed(true);
        } else {

        }
      }
    } catch (error) {

    }
  }
  const [couseCheck, setCourseCheck] = useState('');
  const checkCourse = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      if (userID) {
        console.log(userID);
        const response = await axiosClient.get('/courseRegisters/check/' + userID + '/' + id);
        console.log("response: " + response.data);
        if (response.data === true || response.data === 'true') {
          console.log("Khóa học này đã được user đăng kí học!");
          setCourseCheck('register');
        } else {
          try {
            const response2 = await axiosClient.get('/carts/check/' + userID + '/' + id);
            if (response2.data === true || response2.data === 'true') {
              setCourseCheck('cart');
              console.log("Khóa học này đã được thêm vào giỏ hàng!");
            }
          } catch (error) {

          }
        }
        console.log('course check: ', couseCheck);
      }
    } catch (error) {

    }
  }

  // add to cart
  const addToCard = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const decodedUserId = atob(encodedUserId);

      const response = await axiosClient.post("/carts/create", {
        userId: decodedUserId,
        courseId: id,
      });
      setCourseCheck('cart');
      console.log("Course added to cart:", response.data);
      setShowAlertModal(true);
    } catch (error) {
      console.error("Error adding course to cart:", error.message);
    }
  };

  // show panel khi thêm giỏ hàng thành công
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleCloseAlertModal = () => setShowAlertModal(false);

  //mua ngay
  const handleVNPay = async () => {
    try {
      // Tạo mảng chứa userId và courseId
      const inforArray = [id];

      // Thêm userId vào đầu mảng
      const encodedUserId = localStorage.getItem("userId");
      const userID = atob(encodedUserId);
      inforArray.unshift(userID);

      // Chuyển đổi mảng thành chuỗi, ngăn cách bằng khoảng trắng
      const inforString = inforArray.join(" ");
      console.log("inforString:", inforString);

      const promotional_price = overviewData.promotional_price;

      const response = await axiosClient.post("/vnpay/create_payment", {
        amount: promotional_price * 100,
        infor: inforString
      });

      if (response.data) {
        window.location.href = response.data; // Chuyển hướng đến trang thanh toán của VNPAY
      } else {
        console.error("No response data from VNPAY");
        alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //moda add, edit, delete review
  // modal add review
  let subtitle;
  const [modalAddReviewIsOpen, setIsModalAddReviewOpen] = useState(false);

  function openModalAddReview() {
    setIsModalAddReviewOpen(true);
  }
  function afterOpenModal() {
    subtitle.style.color = '#f00';
  }

  function closeModalAddReview() {
    setIsModalAddReviewOpen(false);
  }

  // modal edit review

  const [modalEditReviewIsOpen, setIsModalEditReviewOpen] = useState(false);

  function openModalEditReview() {
    setIsModalEditReviewOpen(true);
  }
  function closeModalEditReview() {
    setIsModalEditReviewOpen(false);
  }

  const [editedReview, seteditedReview] = useState("");
  const [editedReviewID, seteditedReviewID] = useState("");

  const handleEditReview = async () => {
    try {
      const response = await axiosClient.patch(`/reviews/${editedReviewID}`, {
        content: editedReview,
        rating: defaultRating,
      });

      if (response.data) {
        const updatedRating = response.data.rating;
        const updatedReviewData = reviewData.map((comment) =>
          comment.reviewId === editedReviewID
            ? { ...comment, content: editedReview, rating: updatedRating }
            : comment
        );
        setReviewData(updatedReviewData);

        seteditedReview("");
        console.log('response data edit review: ', response.data);
      } else {
        console.error("Failed to edit comment");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };


  // // modal delete review
  const [deleteReviewID, setDeleteReviewID] = useState("");
  const [modalDeleteReviewIsOpen, setIsModalDeleteReviewOpen] = useState(false);

  function openModalDeleteReview() {
    setIsModalDeleteReviewOpen(true);
  }
  function closeModalDeleteReview() {
    setIsModalDeleteReviewOpen(false);
  }


  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  const handleDeleteReview = async () => {
    try {
      const response = await axiosClient.delete(`/reviews/${deleteReviewID}`);

      if (response.data === "Đánh dấu xóa thành công") {
        setIsReviewed(false);
        const indexToDelete = reviewData.findIndex((comment) => comment.reviewId === deleteReviewID);

        if (indexToDelete !== -1) {
          reviewData.splice(indexToDelete, 1);
        }
        setReviewData(reviewData);
        // const updatedReviewData = reviewData.filter((comment) =>
        //         comment.reviewId !== deleteReviewID
        // );
        // setReviewData(updatedReviewData);

      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };



  const [reviewInput, setReviewInput] = useState('');
  const [defaultRating, setDefaultRating] = useState(0);
  const maxRating = [1, 2, 3, 4, 5];

  const starImgFilled = 'https://raw.githubusercontent.com/tranhonghan/images/main/star_filled.png';
  const starImgCorner = 'https://raw.githubusercontent.com/tranhonghan/images/main/star_corner.png';

  const CustomRatingBar = () => {
    return (
      <div className='flex-row'>
        {maxRating.map((item, key) => (
          <button
            key={item}
            onClick={() => setDefaultRating(item)}
            style={{ margin: '0 5px 15px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
          >
            <img
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              src={item <= defaultRating ? starImgFilled : starImgCorner}
              alt={`Star ${item}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleAddReview = async () => {
    try {
      const response = await axiosClient.post("/reviews", {
        content: reviewInput,
        rating: defaultRating,
        courseId: id,
        userId: userID
      });

      console.log('response add review: ', response.data);
      setReviewData(prevReview => [...prevReview, ...response.data]);
      setIsReviewed(true);
      setReviewInput("");
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };


  // thông tin giảng viên: totalRating, avgRating, ...
  const [teacherProperities, setTeacherProperities] = useState([]);

  // nội dung khóa học
  // lession and comment
  const [videoURL, setVideoURL] = useState('');
  const [titleVideo, setTitleVideo] = useState('');
  const [lessionData, setLessionData] = useState([]);
  const [videoID, setVideoID] = useState();
  // chỉ mục để tô màu video đang xem
  const [lessionIndex, setLessionIndex] = useState(0);
  const [sectionData, setSectionData] = useState([]);
  // thông tin của cái section: tổng số video đã học/ tổng video, tổng thời gian
  const [sectionInfo, setSectionInfo] = useState([]);
  const [demoVideos, setDemoVideos] = useState([]);
  const loadLessionandCommentData = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      setIsLoading(true);
      const videoResponse = await axiosClient.get(`/videos/course=${id}`);
      console.log('video response: ', videoResponse);
      setIsLoading(false);
      const videoList = videoResponse.data;
      const VideoData = videoList.filter((item) => !item.isDeleted).sort((a, b) => a.index - b.index).map((item, index) => ({
        ...item,
        indexArray: index, // Thêm thuộc tính indexArray tương ứng với index của mỗi phần tử
      }));;
      setLessionData(VideoData);

      // mảng video demo
      const video_demo = [];

      // mảng góm nhóm các section 
      // Khởi tạo một đối tượng bản đồ để lưu trữ các video theo sectionId
      const groupedVideos = {};
      console.log('video data trước gom nhóm:', VideoData);
      // Lặp qua mỗi video trong danh sách videos
      VideoData.forEach((video) => {
        const { sectionIndex } = video;

        // Nếu sectionId chưa tồn tại trong groupedVideos, khởi tạo một mảng rỗng
        if (!groupedVideos[sectionIndex]) {
          groupedVideos[sectionIndex] = {
            sectionId: video.sectionId,
            sectionName: video.sectionName,
            sectionIndex: video.sectionIndex,
            isShowVideo: false, // Thêm thuộc tính isShow với giá trị mặc định là false 
            videos: [],
          };
        }

        groupedVideos[sectionIndex].videos.push(video);


        // danh sách video demo
        if (video.isDemo) {
          video_demo.push(video);
        }
      });
      console.log('video data sau gom nhóm:', VideoData);
      console.log('video demo: ', video_demo);
      setDemoVideos(video_demo);


      const sectionArray = Object.values(groupedVideos);

      // Sắp xếp mảng dựa trên sectionIndex
      sectionArray.sort((a, b) => a.sectionIndex - b.sectionIndex);

      // Gán mảng đã sắp xếp vào state
      setSectionData(sectionArray);
      console.log("section data: ", sectionArray);
      // Chuyển đổi object thành mảng và trả về kết quả
      // setSectionData(Object.values(groupedVideos));
      // mảng chứa các thông tin section: tổng video, tổng video đã xem, thời gian
      const result = [];

      // Duyệt qua từng phần tử trong mảng sectionData
      Object.values(groupedVideos).forEach((section) => {
        // Tính tổng số video
        const sumVideo = section.videos.length;

        // Tính tổng thời lượng video (đơn vị là phút)
        let sumTime = 0;
        section.videos.forEach((video) => {
          sumTime += (video.hours * 60) + video.minutes;
        });


        // Thêm đối tượng mới vào mảng kết quả
        result.push({ sumVideo, sumTime });
      });

      // Kết quả là mảng các đối tượng chứa các thuộc tính sumVideo, sumTime
      console.log(result);
      setSectionInfo(result);

    } catch (error) {
      setIsLoading(false);
    }
  }
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

  // modal xem demo khóa học
  const [modalDemoVideosIsOpen, setIsModalDemoVideosOpen] = useState(false);

  function openModalDemoVideos() {
    setIsModalDemoVideosOpen(true);
  }
  function closeModalDemoVideos() {
    setIsModalDemoVideosOpen(false);
  }
  //

  const customStylesDemoVideos = {
    content: {
      width: '50%',
      height: '90%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: '45%',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000
    },
  };

  // hiển thị panel scroll
  const [isVisible, setIsVisible] = useState(true);

  const openPanelOverview = () => {
    // Khi nút được nhấn, chuyển trạng thái của isVisible
    setIsVisible(!isVisible);
  };

  const navigate = useNavigate();

  // chuyển hướng đến trang giáo viên
  const handleCourseClick = () => {
    navigate(`/user/infor-teacher/${Id}`);
  };




  // loading all component 
  if (!teacherData || !reviewData) {
    return <LoadingSpinner />;
  }

  const { Id, fullname } = teacherData;





  return (
    <div>
      {/* panel linh hoạt theo scroll */}
      {isVisible && (
        <div
          id="fixed-div"
          style={{
            position: 'fixed',
            top: '80px', // Cách lề trên 150px  10vh
            right: '10vw', // Cách lề phải 100px
            backgroundColor: 'white',
            padding: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            zIndex: '999',
            width: '20vw', // Độ rộng của thẻ div
          }}
        >
          <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 15 }}>{overviewData.title}</p>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

            <button
              onClick={() => {
                if (demoVideos && demoVideos.length > 0) {
                  const firstVideo = demoVideos[0];
                  const videoURL = processVideoLink(firstVideo?.video_filepath);
                  const title = firstVideo?.title;
                  const indexArray = firstVideo?.indexArray;


                  setVideoURL(videoURL);
                  setTitleVideo(title);
                  setLessionIndex(indexArray);
                  openModalDemoVideos();
                  openPanelOverview();
                  // } else {
                  //   console.log('Video URL, title hoặc indexArray không tồn tại.');
                  // }
                } else {
                  console.log('Danh sách demoVideos rỗng hoặc không tồn tại.');
                }

                console.log('onClick');
              }}
              className="image-container" >
              <img
                src={overviewData.image}
                alt="image"
                className="img-fluid"
                style={{ width: '500px', height: '180px', filter: 'brightness(80%)' }}
              />
              {demoVideos && demoVideos.length > 0 && (
                <div className="circle-icon icon-tag">
                  <FontAwesomeIcon
                    color="black"
                    className=""
                    icon={faPlay}
                    size="2x"
                  />
                </div>
              )}
            </button>
          </div>
          {overviewData.price === overviewData.promotional_price ? (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatPrice(overviewData.price)}
              </p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'underline' }}>đ</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {formatPrice(overviewData.promotional_price)}
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'underline', paddingRight: 15 }}>đ</p>
                <p style={{ color: 'gray', fontSize: '1.0rem', textDecoration: 'line-through' }}>
                  {formatPrice(overviewData.price)}
                </p>
                <p style={{ color: 'gray', fontSize: '0.875rem', textDecoration: 'line-through' }}>đ</p>
              </div>
            </>
          )}
          {overviewData.totalDuration != 0 && (
            <p>Giảm {overviewData.sold}%</p>
          )}



          {/* register */}
          {couseCheck === 'register' && (<>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() =>
                navigate(`/user/course/study/${id}`)
              }>
              Vào học
            </button>
          </>)}
          {/* cart */}
          {couseCheck === 'cart' && (<>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
              <button
                className="btn btn-success"
                style={{ width: '100%' }}
                onClick={() => navigate("/user/cart")}
              >
                Chuyển tới giỏ hàng
              </button>
            </div>

            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                className="btn btn-light"
                style={{ width: '100%' }}
                onClick={() => {
                  handleVNPay();
                }}>
                Mua ngay
              </button>
            </div>
          </>)}
          {/*  */}
          {couseCheck === '' && (<>
            <button
              className="btn btn-primary mb-2"
              style={{ width: '100%' }}
              onClick={() => addToCard(Id)}>
              Thêm vào giỏ hàng
            </button>
            <button
              style={{ width: '100%' }}
              className="btn btn-light"
              onClick={() => {
                handleVNPay();
              }}>
              Mua ngay
            </button>


          </>)}
          <div style={{ paddingTop: 10 }}>
            {overviewData.totalDuration ? (
              <p ><FontAwesomeIcon icon={faVideo} color="gray" /> Thời lượng: {parseFloat(overviewData.totalDuration).toFixed(2)} giờ</p>
            ) : (
              <p ><FontAwesomeIcon icon={faVideo} color="gray" /> Thời lượng:  giờ</p>
            )}
            <p><FontAwesomeIcon icon={faBook} color="gray" />  Giáo trình:  {overviewData.numberOfVideos} bài giảng</p>
            <p><FontAwesomeIcon icon={faClock} color="gray" />  Sở hữu khóa học trọn đời</p>
          </div>

        </div>
      )}

      <Header />

      {/* panel top */}
      <div data-bs-spy="scroll" data-bs-target="#goTop">
        <div id="topbar" style={{ background: "#0B3955" }}>
          <div className="container-fluid pt-5 ">
            <div className="row">
              <div className="col-sm-2"></div>
              <div className="col-sm-6 ">
                <p className="text-white" style={{ fontWeight: 'bold', fontSize: '2em' }}>{overviewData.title}</p>
                <p className="text-white" style={{ fontSize: '1.25em', paddingBottom: 15 }}>{overviewData.description}</p>

                <p className="text-white pb-1">
                  Lần cập nhật mới nhất : <span className="fw-bold"> {formatDate(overviewData.updateAt)}</span>
                </p>


                <div className="d-inline-block text-white pt-1 pb-1">
                  <span> {overviewData.rating}⭐ ({reviewData.length} đánh giá) </span>
                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div className="d-inline-block text-white">
                  <span>
                    <i className="fa fa-users" aria-hidden="true"></i>{" "}
                    {studentCount} Học viên{" "}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 5, paddingBottom: 15 }}>
                  <p style={{ margin: '0', marginRight: '5px', color: 'white' }}>Giảng viên:</p>
                  <Link
                    to={`/user/info-teacher/${Id}`}
                    target="_blank" // Đây là thuộc tính để mở tab mới
                    rel="noopener noreferrer" // Cần thêm thuộc tính này để tránh các vấn đề bảo mật
                    // onClick={handleCourseClick}
                    style={{ color: 'blue', textDecoration: 'underline' }}
                  >
                    <span style={{ color: 'rgb(51 , 153, 255)' }}>{fullname}</span>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <div>

      </div>
      <div className="container-fluid pt-5 ">
        {/* content */}
        <div className="row">
          <div className="col-sm-2"></div>
          <div className="col-sm-6 ">

            {/* Course Info hiện ra khi màn hình nhỏ  */}
            <div id="hidden-div" style={{ display: 'none' }} className="bg-light bg-gradient  card shadow mb-3 p-3 ">
              <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 15 }}>{overviewData.title}</p>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img
                  src={overviewData.image}
                  alt="Avatar"
                  className="img-fluid"
                  style={{ width: '100vw', height: '300px' }}
                />
              </div>
              {overviewData.price === overviewData.promotional_price ? (
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {formatPrice(overviewData.price)}
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 'bold', textDecoration: 'underline' }}>đ</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {formatPrice(overviewData.promotional_price)}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'underline', paddingRight: 15 }}>đ</p>
                    <p style={{ color: 'gray', fontSize: '1.0rem', textDecoration: 'line-through' }}>
                      {formatPrice(overviewData.price)}
                    </p>
                    <p style={{ color: 'gray', fontSize: '0.875rem', textDecoration: 'line-through' }}>đ</p>
                  </div>
                </>
              )}
              {overviewData.totalDuration != 0 && (
                <p>Giảm {overviewData.sold}%</p>
              )}



              {/* register */}
              {couseCheck === 'register' && (<>
                <button
                  style={{ width: '100%', color: 'white', backgroundColor: 'rgb(37, 99, 235)', padding: '10px 20px', border: '0.5px solid black', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                  onClick={() =>
                    navigate(`/user/course/study/${id}`)
                  }>
                  <p style={{ color: 'white', paddingRight: 0, fontWeight: 'bold' }}>Vào học</p>
                </button>
              </>)}
              {/* cart */}
              {couseCheck === 'cart' && (<>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
                  <button
                    style={{ width: '100%', color: 'white', backgroundColor: 'rgb(37, 99, 235)', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                    onClick={() => navigate("/user/cart")}
                  >
                    <p style={{ color: 'white', paddingRight: 0, fontWeight: 'bold' }}>Chuyển tới giỏ hàng</p>
                  </button>
                </div>

                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    style={{ width: '100%', color: 'white', backgroundColor: 'white', padding: '10px 20px', border: '0.5px solid black', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                    onClick={() => {
                      handleVNPay();
                    }}>
                    <p style={{ color: 'black', paddingRight: 0, fontWeight: 'bold' }}>Mua ngay</p>
                  </button>
                </div>
              </>)}
              {/*  */}
              {couseCheck === '' && (<>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
                  <button
                    style={{ width: '100%', color: 'white', backgroundColor: 'rgb(37, 99, 235)', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                    onClick={() => addToCard(Id)}>
                    <p style={{ color: 'white', paddingRight: 0, fontWeight: 'bold' }}>Thêm vào giỏ hàng</p>
                  </button>
                </div>

                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    style={{ width: '100%', color: 'white', backgroundColor: 'white', padding: '10px 20px', border: '0.5px solid black', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                    onClick={() => {
                      handleVNPay();
                    }}>
                    <p style={{ color: 'black', paddingRight: 0, fontWeight: 'bold' }}>Mua ngay</p>
                  </button>
                </div>
              </>)}

            </div>

            {/* giới thiệu khóa học */}
            <div className="bg-light bg-gradient  card shadow mb-3 p-3">
              <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 15 }}>Giới thiệu khóa học</p>
              <div>
                {isExpanded ? (
                  <p dangerouslySetInnerHTML={{ __html: overviewData.introduce }} />
                ) : (
                  overviewData.introduce && <p dangerouslySetInnerHTML={{ __html: overviewData.introduce.slice(0, 500) + '...' }} />
                )}
                {!isExpanded ? (
                  <button onClick={handleToggleExpand} className="btn">
                    <p style={{ color: 'blue', textDecoration: 'underline' }}>Xem thêm</p>
                  </button>
                ) : (
                  <button onClick={handleToggleExpand} className="btn">
                    <p style={{ color: 'blue', textDecoration: 'underline' }}>Thu gọn</p>
                  </button>
                )}
              </div>
            </div>

            {/* bạn sẽ học được */}
            <div className="bg-light bg-gradient  card shadow mb-3 p-3 ">
              <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 15 }}>Bạn sẽ học được</p>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div >
                  <table>
                    <tbody >
                      {leftColumnCB.map((leftBenefit, index) => (
                        <tr key={index}>
                          <td key={leftBenefit.Id} style={{ maxWidth: '350px', wordWrap: 'break-word' }}>
                            <FontAwesomeIcon icon={faCheck} /> {leftBenefit.content}
                          </td>
                          {/* Kiểm tra xem phần tử tương ứng từ mảng rightColumnCB có tồn tại không */}
                          {/* Nếu tồn tại, hiển thị nó */}
                          {rightColumnCB[index] && (
                            <td style={{ maxWidth: '350px', wordWrap: 'break-word' }}>
                              <FontAwesomeIcon icon={faCheck} /> {rightColumnCB[index].content}
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



            {/* nội dung khóa học */}
            <div className="bg-light bg-gradient  card shadow mb-3 p-3">
              <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 15 }}>Nội dung khóa học</p>
              {overviewData.totalDuration ? (
                <p style={{ paddingBottom: 15 }}> {sectionData.length} phần - {overviewData.numberOfVideos} bài giảng - {parseFloat(overviewData.totalDuration).toFixed(2)} giờ</p>
              ) : (
                <p style={{ paddingBottom: 15 }}> {sectionData.length} phần - {overviewData.numberOfVideos} bài giảng </p>
              )}

              {sectionData && (
                sectionData.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <button
                      className="btn btn-light"
                      style={{ backgroundColor: 'rgb(227, 243, 253)', width: '100%', padding: 5 }}
                      onClick={() => {
                        const updatedSectionData = [...sectionData];

                        updatedSectionData[sectionIndex] = {
                          ...section,
                          isShowVideo: !section.isShowVideo
                        };

                        setSectionData(updatedSectionData);
                      }}>
                      <p className='py-0 my-0' style={{ fontWeight: 'bold', paddingLeft: 10, textAlign: 'left' }}
                      ><FontAwesomeIcon icon={faChevronDown} /> Phần {sectionIndex + 1}. {section.sectionName} {section.isShowVideo}     </p>
                      <p className='py-0 my-0' style={{ textAlign: 'left', paddingLeft: 15, fontSize: '14px' }}> {sectionInfo[sectionIndex]?.sumVideo} bài giảng - {sectionInfo[sectionIndex]?.sumTime} phút</p>
                    </button>
                    {section.isShowVideo.toString() === "true" && section.videos.length > 0 && (<>
                      {section.videos.map((video, index) => (
                        <div key={index}>
                          {/* Hiển thị thông tin của từng video */}
                          <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 5, paddingTop: 3, backgroundColor: 'white' }}>
                            <div style={{ paddingLeft: 25, paddingTop: 0 }} onClick={() => {
                              if (video.indexArray !== lessionIndex) {   // nếu như có thuộc tính video.isDemo thì hiển thị link và cho click vào
                              }
                            }}
                            >
                              <p className="text-left pb-0 mb-0" >{index + 1}. {video.title}</p>
                              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                                <p className='py-0 my-0' style={{ fontSize: '14px', paddingLeft: 5, color: 'gray' }}>
                                  <FontAwesomeIcon icon={faVideo} color='gray' />&nbsp;
                                  {video.hours !== 0 && `${video.hours} giờ `}
                                  {video.minutes !== 0 && `${video.minutes} phút`}
                                  {video.hours === 0 && video.minutes === 0 && `${video.seconds} giây`}
                                </p>
                                {video.isDemo && (
                                  <button className="btn btn-link" onClick={() => {
                                    setVideoURL(processVideoLink(lessionData[video.indexArray].video_filepath));
                                    setTitleVideo(lessionData[video.indexArray].title);
                                    setLessionIndex(video.indexArray);
                                    openModalDemoVideos();
                                    openPanelOverview();
                                  }}

                                  >
                                    <p className='py-0 my-0' style={{ fontSize: '14px', color: 'blue' }}>Học thử</p>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>)}


                  </div>
                ))
              )}
            </div>


            {/* giảng viên */}
            <div className="bg-light bg-gradient  card shadow mb-3 p-3">
              <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 10 }}>Giảng viên</p>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 5, paddingBottom: 15 }}>
                <Link
                  to={`/user/info-teacher/${Id}`}
                  target="_blank" // Đây là thuộc tính để mở tab mới
                  rel="noopener noreferrer" // Cần thêm thuộc tính này để tránh các vấn đề bảo mật
                  // onClick={handleCourseClick}
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  <span style={{ color: 'blue', fontWeight: '15px', fontSize: '1.25em' }}>{fullname}</span>
                </Link>
              </div>


              <p style={{ color: 'gray', paddingBottom: 15, }}>{teacherData.description}</p>
              <div className="container">
                <div className="row">

                  <div className="col-sm-3">
                    <img
                      src={teacherData?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/694px-Unknown_person.jpg'}
                      alt="Avatar"
                      className="avatar"
                      style={{ width: '150px', height: '150px' }}
                    />
                  </div>

                  <div className="col-sm-8">
                    {teacherProperities && teacherProperities.length > 0 && (
                      <>
                        <p><FontAwesomeIcon icon={faStar} /> {parseFloat(teacherProperities[0]?.avgRating).toFixed(2)} xếp hạng</p>
                        <p><FontAwesomeIcon icon={faStar} /> {teacherProperities[0]?.totalRating} đánh giá</p>
                        <p><FontAwesomeIcon icon={faUser} style={{ paddingRight: 3 }} />  {teacherProperities[0]?.totalStudent} học viên</p>
                        <p><FontAwesomeIcon icon={faCirclePlay} /> {teacherProperities[0]?.totalCourse} khóa học</p>
                      </>
                    )}


                  </div>
                </div>
              </div>
              <div style={{ paddingTop: 15 }}>

                <p>{teacherData.introduce}</p>


              </div>
            </div>

            {/* Các khóa học tương tự của giảng viên và trong cùng danh mục đó */}
            <div className="bg-light bg-gradient  card shadow mb-3 p-3">
              <p style={{ fontWeight: '15px', fontSize: '1.45em', paddingBottom: 10 }}>Khóa học liên quan</p>
              <div className="row justify-content-between " style={{ paddingRight: 10 }}>
                {courseProposal &&
                  (
                    courseProposal.map((item) => (
                      <div>
                        <div
                          key={item.cart_id}
                          className="card-body d-flex align-items-center"
                        >
                          <Link
                            to={`/user/course/${item.course_id}`}
                            className="d-inline-block"
                            target="_blank" // Đây là thuộc tính để mở tab mới
                            rel="noopener noreferrer" // Cần thêm thuộc tính này để tránh các vấn đề bảo mật
                          >
                            <div
                              style={{
                                width: "100px",
                                height: "80px",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={item.image}
                                className="img-fluid"
                                alt={item.user_name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "fill",
                                }}
                              />
                            </div>
                          </Link>
                          <div style={{ paddingLeft: 5 }}>
                            <p style={{ fontWeight: "550", paddingTop: 10 }}>
                              {item.title}
                            </p>
                            <p style={{ color: "gray" }}>
                              Giảng viên: {item.user_name}
                              <br />
                              {"⭐".repeat(Math.floor(item.rating))}{" "}
                              <span>({item.rating.toFixed(1)})</span>
                            </p>
                          </div>
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ paddingLeft: 10 }}>
                              {item.price === item.promotional_price ? (
                                <div className="d-flex">
                                  <p className="fs-5 fw-bold">
                                    {formatPrice(item.price)}
                                  </p>
                                  <span className="fs-5 fw-bold">đ</span>
                                </div>
                              ) : (
                                <div>
                                  <div>
                                    <span className="fs-5 fw-bold">
                                      {formatPrice(item.promotional_price)}
                                    </span>
                                    <span className="fs-6 fw-bold">đ</span>
                                  </div>
                                  <span
                                    className="small"
                                    style={{ textDecoration: "line-through" }}
                                  >
                                    {formatPrice(item.price)}
                                  </span>
                                  <span className="small">đ</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <hr className="p-1" />
                        </div>
                        <hr />
                      </div>
                    ))
                  )
                }
              </div>
            </div>

            {/* đánh giá */}
            <hr style={{ paddingTop: 15 }} />
            <div className=" bg-gradient  mb-3 p-3">
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'start', width: '100%' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1.5em' }}>⭐{overviewData.rating} xếp hạng khóa học <span style={{ color: 'gray' }}>&bull;</span> {reviewData.length} xếp hạng</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {reviewData.length > 0 ? (
                  reviewData.map((review, index) => (
                    <div key={index} >
                      <div>
                        <div className="pb-0 mb-0" style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}>
                          <img
                            src={review.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/694px-Unknown_person.jpg'}
                            alt="Avatar"
                            className="avatar"
                            style={{ width: '35px', height: '35px' }}
                          />
                          <div className="pb-0 mb-0">
                            <div style={{ display: 'flex', flexDirection: 'row', paddingBottom: 0, marginBottom: 0 }}>
                              <p className='py-0 my-0'>{review.fullname}</p>
                              {review.userId == userID && (
                                <>
                                  <FontAwesomeIcon
                                    icon={faPencil}
                                    onClick={() => {
                                      openModalEditReview();
                                      seteditedReviewID(review.reviewId);
                                      seteditedReview(review.content);
                                    }}
                                    size="sm"
                                    style={{ paddingLeft: 15 }}
                                    color='gray'

                                  />
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    onClick={() => {
                                      setDeleteReviewID(review.reviewId);
                                      openModalDeleteReview();
                                    }}
                                    size="sm"
                                    style={{ paddingLeft: 15 }}
                                    color='gray'
                                  />
                                </>
                              )}


                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', paddingTop: 0 }}>
                              <p className='py-0 my-0' style={{ fontSize: 12, paddingRight: 10 }}>
                                {'⭐'.repeat(Math.floor(review.rating))}
                              </p>
                              <p className='py-0 my-0' style={{ fontSize: '0.8em', fontWeight: 'bold', color: 'gray' }}>
                                {formatTimeAgo(review.create)}
                              </p>
                            </div>

                          </div>
                        </div>
                        <p className='py-0 my-0' style={{ width: '80vh', maxWidth: '80vh', wordWrap: 'break-word' }}>
                          {review.content}
                        </p>
                        <hr className='py-0 my-0'></hr>
                      </div>
                    </div>
                  ))
                ) : (<p style={{ padding: 10 }}> Không có đánh giá nào. Hãy để để đánh giá của bạn. </p>)}
                {couseCheck === 'register' && isReviewed === false && (
                  <button onClick={openModalAddReview} style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
                    Đánh giá
                  </button>
                )}


              </div>
            </div>

          </div>
        </div>
      </div>
      {/* modal thông báo giỏ hàng */}
      <div
        className="modal"
        tabIndex="-1"
        style={{ display: showAlertModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontWeight: 'bold' }}>Đã thêm vào giỏ hàng</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAlertModal}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', paddingRight: 10 }}>
                  <FontAwesomeIcon icon={faCheckCircle} color="#19A38C" size="2x" />

                </div>
                <img
                  src={overviewData.image}
                  alt="Avatar"
                  className="img-fluid"
                  style={{ width: '75px', height: '75px' }}
                />
                <div style={{ paddingLeft: 5 }}>
                  <p style={{ fontWeight: '550' }}>{overviewData.title}</p>
                  <p style={{ color: 'gray' }}>{overviewData.description}</p>
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCloseAlertModal}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/user/cart")}
              >
                Chuyển tới giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* add modal review*/}
      <Modal
        isOpen={modalAddReviewIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalAddReview}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Đánh giá</h2>
          <FontAwesomeIcon
            icon={faClose}
            onClick={closeModalAddReview}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <CustomRatingBar />
        </div>

        <div style={{ width: '500px', paddingTop: 10 }}>
          <p style={{ fontWeight: '10' }}>Nhận xét của bạn</p>
          <textarea
            style={{ width: '450px', borderWidth: '0.2px', paddingLeft: '5px', minHeight: '80px', fontSize: '14px' }}
            value={reviewInput}
            onChange={e => setReviewInput(e.target.value)}
            placeholder="Đánh giá của bạn..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
          <button
            onClick={() => {
              closeModalAddReview();
              handleAddReview();
            }}
            style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
            Gửi đánh giá
          </button>
        </div>
      </Modal>
      {/* edit modal review*/}
      <Modal
        isOpen={modalEditReviewIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalEditReview}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Đánh giá</h2>
          <FontAwesomeIcon
            icon={faClose}
            onClick={closeModalEditReview}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <CustomRatingBar />
        </div>

        <div style={{ width: '500px', paddingTop: 10 }}>
          <p style={{ fontWeight: '10' }}>Nhận xét của bạn</p>
          <textarea
            style={{ width: '450px', borderWidth: '0.2px', paddingLeft: '5px', minHeight: '80px', fontSize: '14px' }}
            value={editedReview}
            onChange={e => seteditedReview(e.target.value)}
            placeholder="Đánh giá của bạn..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
          <button
            onClick={() => {
              closeModalEditReview();
              handleEditReview();
            }}
            style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
            Chỉnh sửa đánh giá
          </button>
        </div>
      </Modal>
      {/* delete modal review*/}
      <Modal
        isOpen={modalDeleteReviewIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalDeleteReview}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Thông báo</h2>
          <FontAwesomeIcon
            icon={faClose}
            onClick={closeModalDeleteReview}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <p>Bạn có chắc chắc muốn xóa đánh giá này không?</p>
        </div>


        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
          <button
            onClick={() => {
              closeModalDeleteReview();
              handleDeleteReview();
            }}
            style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
            Xóa
          </button>
          <button
            onClick={() => {
              closeModalDeleteReview();
            }}
            style={{ marginLeft: 50, width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
            Thoát
          </button>
        </div>
      </Modal>
      {/* demo video*/}
      <Modal
        isOpen={modalDemoVideosIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={() => {
          closeModalDemoVideos();
          openPanelOverview();
        }}
        style={customStylesDemoVideos}
        contentLabel="Example Modal"
      >
        {/* Phần còn lại của modal */}
        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          {/* Button close và tiêu đề */}
          <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Học thử</h2>
          <FontAwesomeIcon
            icon={faClose}
            onClick={() => {
              closeModalDemoVideos();
              openPanelOverview();
            }}
          />
        </div>
        {/* Hiển thị video */}
        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em', paddingTop: 10, paddingBottom: 10 }} >{overviewData.title}</h2>
        <div style={{ height: '45%', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, width: '100%' }}>
          <iframe
            style={{ height: '100%', width: '75%' }}
            src={videoURL}
            allowFullScreen
            title={titleVideo}
          ></iframe>
        </div>
        <p style={{ paddingTop: 5, fontWeight: 'bold' }}>Video học thử</p>
        {/* Phần danh sách video */}
        <div > {/* Đặt overflow: auto ở đây */}
          {demoVideos.length > 0 && (
            <>
              {demoVideos.map((video, index) => (
                <div key={index}>
                  {/* Hiển thị thông tin của từng video */}
                  <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 5, paddingTop: 10, backgroundColor: video.indexArray === lessionIndex ? 'rgb(220, 220, 220)' : 'white', }}>

                    <div
                      style={{ paddingLeft: 25 }}
                      onClick={() => {
                        if (video.indexArray !== lessionIndex) {
                          setVideoURL(processVideoLink(demoVideos[index].video_filepath));
                          setTitleVideo(demoVideos[index].title);
                          setLessionIndex(demoVideos[index].indexArray);
                        }
                      }}
                    >
                      <p className='py-0 my-0' style={{ fontSize: '14px', textAlign: 'left' }}> Bài {video.indexArray + 1}. {video.title}</p>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <p className='py-0 my-0' style={{ fontSize: '14px', paddingLeft: 5, color: 'gray' }}>
                          <FontAwesomeIcon icon={faVideo} color='gray' />&nbsp;
                          {video.hours !== 0 && `${video.hours} giờ `}
                          {video.minutes !== 0 && `${video.minutes} phút`}
                          {video.hours === 0 && video.minutes === 0 && `${video.seconds} giây`}
                        </p>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default CourseDetail;
