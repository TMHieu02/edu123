import React from 'react';
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPencil, faTrash, faChevronDown, faVideo, faCheckSquare, faSquare, faChevronUp, faTimes, faQuestion } from "@fortawesome/free-solid-svg-icons";
import Modal from 'react-modal';
import Header from "../Header/Header";
import ResultExam from '../Exam/ResultExam';
import logo from "../../../assets/images/logo.png";

const CourseStudyNetworkSupport = () => {
        const navigate = useNavigate();
        const { courseId } = useParams();
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



        // dữ liệu chung 
        const [userID, setUserID] = useState();
        const [userAvatar, setUserAvatar] = useState('');
        const [documentData, setDocumentData] = useState([]);
        const [overviewData, setOverviewData] = useState([]);
        const [leftColumnCB, setLeftColumnCB] = useState([]);
        const [rightColumnCB, setRightColumnCB] = useState([]);
        const getData = async () => {
                try {
                        // userID
                        const encodedUserId = localStorage.getItem("userId");
                        const userID = parseInt(atob(encodedUserId), 10);
                        console.log('userID: ', userID);
                        setUserID(userID);

                        // Chạy các lời gọi API song song
                        const [
                                documentResponse,
                                overviewResponse,
                                courseOverviewResponse,
                                avatarResponse
                        ] = await Promise.all([
                                axiosClient.get(`/documents/course=${courseId}`),
                                axiosClient.get(`/courses/${courseId}`),
                                axiosClient.get(`/course_overview/course=${courseId}`),
                                axiosClient.get(`/users/${userID}`)
                        ]);

                        // Xử lý kết quả các lời gọi API                    
                        setDocumentData(documentResponse.data);
                        setOverviewData(overviewResponse.data);

                        const responseData = courseOverviewResponse.data;
                        const halfIndex = Math.ceil(responseData.length / 2);
                        const leftColumn = responseData.slice(0, halfIndex);
                        setLeftColumnCB(leftColumn);
                        const rightColumn = responseData.slice(halfIndex);
                        setRightColumnCB(rightColumn);

                        setUserAvatar(avatarResponse.data.avatar);
                } catch (e) {
                        // Xử lý lỗi nếu có
                        console.log('Lỗi khi lấy dữ liệu:', e);
                }
        };

        useEffect(() => {
                getData();
                loadLessionandCommentData();
                checkReview();
                loadReviewData();
        }, [])
        useEffect(() => {
                const checkCourseRegister = async () => {
                        try {
                                const userIdLocal = localStorage.getItem("userId");
                                if (userIdLocal) {
                                        const userId = parseInt(atob(userIdLocal), 10);
                                        const response1 = await axiosClient.get(
                                                `/courseRegisters/check/${userId}/${courseId}`
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
        }, [courseId, navigate]);
        const [selectedOption, setSelectedOption] = useState('overview');
        // tài liệu





        // đánh giá
        const [reviewData, setReviewData] = useState([]);
        const loadReviewData = async () => {
                try {
                        const reviewResponse = await axiosClient.get(`/reviews/course=${courseId}`);
                        const reviewData = reviewResponse.data;
                        console.log(reviewData);
                        setReviewData(reviewResponse.data);
                        console.log('reviewData: ', reviewData);
                } catch (error) {

                }
        }
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
                                loadReviewData();
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


        const [isReviewed, setIsReviewed] = useState(false);
        const [reviewInput, setReviewInput] = useState('');
        const checkReview = async () => {
                try {
                        const encodedUserId = localStorage.getItem("userId");
                        const userID = parseInt(atob(encodedUserId), 10);
                        console.log('check')
                        const response = await axiosClient.get('/reviews/check/' + userID + '/' + courseId);
                        const dataCheck = JSON.stringify(response.data);
                        console.log("response check: " + dataCheck);
                        const responseData = JSON.parse(dataCheck);

                        // Truy cập vào thuộc tính courseId
                        console.log("response courseId: " + responseData[0].courseId);
                        if (responseData[0].courseId) {
                                console.log("Đã review khóa học này rồi!");
                                setIsReviewed(true);
                        }
                } catch (error) {

                }
        }

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
                                courseId: courseId,
                                userId: userID
                        });

                        console.log('response add review: ', response.data);
                        setReviewData(prevReview => [...prevReview, ...response.data]);
                        loadReviewData();
                        setIsReviewed(true);
                        setReviewInput("");
                } catch (error) {
                        console.error("Error adding review:", error);
                }
        };

        // lession and comment
        const [videoURL, setVideoURL] = useState('');
        const [titleVideo, setTitleVideo] = useState('');
        const [lessionData, setLessionData] = useState([]);
        const [videoID, setVideoID] = useState();
        // chỉ mục để tô màu video đang xem
        const [lessionIndex, setLessionIndex] = useState(0);
        const [sectionData, setSectionData] = useState([]);
        const loadLessionandCommentData = async () => {
                try {

                        console.log('loadLessionAndCommentData');

                        const encodedUserId = localStorage.getItem("userId");
                        const userID = parseInt(atob(encodedUserId), 10);

                        // Thực hiện các yêu cầu HTTP song song
                        const [videoResponse, examResponse] = await Promise.all([
                                axiosClient.get(`/videos/course=${courseId}/user=${userID}`),
                                axiosClient.get(`/exams/course=${courseId}/user=${userID}`)
                        ]);

                        // Xử lý dữ liệu video
                        const videoList = videoResponse.data;
                        const VideoData = videoList
                                .filter((item) => !item.isDeleted)
                                .sort((a, b) => {
                                        if (a.sectionIndex === b.sectionIndex) {
                                                return a.index - b.index;
                                        }
                                        return a.sectionIndex - b.sectionIndex;
                                })
                                .map((item, index) => ({
                                        ...item,
                                        indexArray: index, // Thêm thuộc tính indexArray tương ứng với index của mỗi phần tử
                                }));

                        setLessionData(VideoData);
                        // mảng để hiển thị đánh dấu video đã học 
                        console.log('video data: ', VideoData);

                        // Xử lý dữ liệu exam
                        const ExamData = examResponse.data.filter((item) => !item.isDeleted).sort((a, b) => a.index - b.index);
                        setExamData(ExamData);


                        // tìm chỉ số index của video viewed có index lớn nhất                        
                        let maxViewedIndex = null; // Khởi tạo biến lưu trữ chỉ số của video `isViewed` lớn nhất

                        VideoData.forEach((video, index) => {
                                if (video.isViewed === true) {
                                        if (maxViewedIndex === null || index > maxViewedIndex) {
                                                maxViewedIndex = index; // Cập nhật chỉ số của video `isViewed` lớn nhất
                                        }
                                }
                        });
                        console.log('chỉ số viewed lớn nhất: ', maxViewedIndex);
                        // Nếu không tìm thấy phần tử có isViewed là true, trả về chỉ số của phần tử đầu tiên
                        const resultIndex = maxViewedIndex !== null ? maxViewedIndex : 0;

                        console.log("Chỉ số của phần tử có isViewed lớn nhất là:", resultIndex);
                        setLessionIndex(resultIndex);

                        // mảng để hiển thị đánh dấu video đã học 
                        const progressVideo = VideoData.map(video => video.isViewed);
                        console.log('progress Video', progressVideo);
                        progressVideo[resultIndex] = true;
                        setProgressVideo(progressVideo);
                        console.log('progress video: ', progressVideo);
                        //loadCommentData
                        const firstLessionID = VideoData?.[resultIndex]?.videoId;

                        setVideoID(firstLessionID);
                        loadCommentData(firstLessionID);

                        //setVideoURL
                        const processedLink = processVideoLink(VideoData[resultIndex].video_filepath);
                        setVideoURL(processedLink);
                        console.log(VideoData[resultIndex].video_filepath);
                        //setTitleVideo
                        setTitleVideo(VideoData[resultIndex].title);
                        //cập nhật tiến độ
                        trackProgress(VideoData?.[resultIndex]?.videoId);


                        // mảng góm nhóm các section 
                        // Khởi tạo một đối tượng bản đồ để lưu trữ các video theo sectionId
                        const groupedVideos = {};

                        // Lặp qua mỗi video trong danh sách videos
                        VideoData.forEach((video) => {
                                const { sectionIndex } = video;  // trích xuất thuộc tính sectionId trong video
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
                                console.log("có giá trị section nên map exam vào!")

                                ExamData.forEach((exam) => {
                                        const { index } = exam;   // trích xuất ra phần tử index của exam để lấy tương ứng với sectoion
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
                                console.log("ko có giá trị section nên ko map exam vào!")
                        }


                        const sectionArray = Object.values(groupedVideos);

                        // Sắp xếp mảng dựa trên sectionIndex
                        sectionArray.sort((a, b) => a.sectionIndex - b.sectionIndex);

                        // Gán mảng đã sắp xếp vào state
                        setSectionData(sectionArray);
                        // console.log("section data: ", sectionArray);
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
                                        const totalMinutes = (hourInt * 60) + minuteInt;
                                        sumTimeExam += totalMinutes;
                                });

                                // Tính tổng thời lượng video (đơn vị là phút)
                                let sumTime = 0;
                                section.videos.forEach((video) => {
                                        sumTime += (video.hours * 60) + video.minutes;
                                });
                                sumTime += sumTimeExam;

                                // Tính tổng số video đã xem + số bài kiểm tra đã làm
                                const sumViewed = section.videos.filter((video) => video.isViewed).length + section.exams.filter((exam) => exam.isExam).length;


                                // Thêm đối tượng mới vào mảng kết quả
                                result.push({ sumVideo, sumTime, sumViewed });
                        });

                        // Kết quả là mảng các đối tượng chứa các thuộc tính sumVideo, sumTime, sumViewed                        
                        setSectionInfo(result);



                } catch (error) {

                }
        }
        // thông tin của cái section: tổng số video đã học/ tổng video, tổng thời gian
        const [sectionInfo, setSectionInfo] = useState([]);
        // update sum viewed
        const updateSumViewed = (indexSection) => {
                const updatedSectionInfo = [...sectionInfo];
                if (updatedSectionInfo[indexSection].sumViewed !== updatedSectionInfo[indexSection].sumVideo) {
                        updatedSectionInfo[indexSection].sumViewed += 1;
                }

                setSectionInfo(updatedSectionInfo);
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

        // cập nhật trạng thái học tập 
        const [progressVideo, setProgressVideo] = useState([]);
        const trackProgress = async (videoID, index) => {
                console.log("trackingProgress");
                try {
                        const userIdLocal = localStorage.getItem("userId");
                        if (userIdLocal) {
                                const userId = parseInt(atob(userIdLocal), 10);

                                const responseTrackProgress = await axiosClient.post("/learningprogress", {
                                        isFinish: true,
                                        progress: 0,
                                        userId: userId,
                                        videoId: videoID
                                });
                                if (responseTrackProgress.status === 201) {
                                        console.log("tracking video thành công!");
                                }

                        } else {

                        }
                } catch (error) {
                        console.error("Error checking course and video registration:", error);
                }
        }


        // cập nhật lại phần tử của video đã học thành true trên mảng hiển thị trạng thái 
        const updateProgressVideo = async (index) => {
                const updatedProgressVideo = [...progressVideo];

                updatedProgressVideo[index] = true;

                setProgressVideo(updatedProgressVideo);
        }

        // nút xem thêm 
        const [isExpanded, setIsExpanded] = useState(false);
        const containerRef = useRef(null);
        const handleToggleExpand = () => {
                setIsExpanded(!isExpanded);
                if (!isExpanded && containerRef.current) {
                        containerRef.current.scrollIntoView({ behavior: 'smooth' });
                }
        };





        // bình luận
        const [comments, setComments] = useState([]);
        const loadCommentData = async (videoID) => {
                try {
                        const response = await axiosClient.get(`/comments/video=${videoID}`);
                        const commentsData = response.data;

                        // Lọc ra các comment chính
                        const mainComments = commentsData.filter(comment => !comment.isDeleted && comment.parentCommentId === 0);

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
                        const commentsWithReplies = mainComments.map(mainComment => ({
                                ...mainComment,
                                replies: [], // repliesMap.get(mainComment.commentId) || [], // Sử dụng replies từ map, nếu không có thì trả về mảng rỗng
                                isCommentReply: repliesMap.get(mainComment.commentId) ? true : false,
                                repliesLength: (repliesMap.get(mainComment.commentId) || []).length,
                                showReplies: false, // Mặc định không hiển thị phản hồi   
                                showInputReply: false,
                        }));

                        setComments(commentsWithReplies);
                        console.log('comment list: ', commentsWithReplies);

                }
                catch (error) {
                        console.error("Error loading comment:", error);
                }
        }

        const handleToggleReplies = async (index, commentId) => {
                const updatedComments = [...comments];
                updatedComments[index].showReplies = !updatedComments[index].showReplies;
                // cập nhật các comment reply
                if (updatedComments[index].replies.length == 0) {
                        try {

                                const response = await axiosClient.get(`/comments/${commentId}/features`);
                                const commentsData = response.data.filter((item) => !item.isDeleted);
                                console.log('comment reply api: ', commentsData);
                                updatedComments[index].replies = commentsData;

                        }
                        catch (error) {
                                console.error("Error loading comment:", error);
                        }
                        console.log("Có replies");
                } else if (updatedComments[index].replies.length != updatedComments[index].repliesLength) {
                        try {

                                const response = await axiosClient.get(`/comments/${commentId}/features`);
                                const commentsData = response.data.filter((item) => !item.isDeleted);
                                console.log('comment reply api: ', commentsData);
                                updatedComments[index].replies = commentsData;
                                updatedComments[index].repliesLength = updatedComments[index].repliesLength - 1;
                        }
                        catch (error) {
                                console.error("Error loading comment:", error);
                        }
                        console.log("Có replies");
                }
                else {
                        console.log("Không có replies hoặc replies rỗng");
                }

                console.log('update comment: ', updatedComments[index]);
                setComments(updatedComments);
        };

        const handleToggleInputReply = async (index) => {
                const updatedComments = [...comments];
                updatedComments[index].showInputReply = !updatedComments[index].showInputReply;
                setComments(updatedComments);
        };

        const [showButtonInput, setShowButtonInput] = useState(false);


        // add comment
        const [commentInput, setCommentInput] = useState('');
        const handleAddComment = async () => {
                try {
                        const encodedUserId = localStorage.getItem("userId");
                        const userID = parseInt(atob(encodedUserId), 10);
                        const response = await axiosClient.post("/comments/create", {
                                content: commentInput,
                                videoId: videoID,
                                userId: userID,
                                parentCommentId: 0,
                        });
                        // Thêm phản hồi mới vào mảng comments
                        const newComment = {
                                ...response.data[0],
                                replies: [],
                                isCommentReply: false,
                                repliesLength: 0,
                                showReplies: false,
                                showInputReply: false
                        };
                        setComments(prevComments => [newComment, ...prevComments]);
                        // loadCommentData(videoID);
                        setCommentInput("");
                } catch (error) {
                        console.error("Error adding comment:", error);
                }
        };

        //add comment reply
        const [commentReply, setCommentReply] = useState('');
        const handleAddReply = async (parentCommentId, index) => {
                console.log('add reply, index: ', index);
                console.log('add reply, parentCommentId: ', parentCommentId);
                try {
                        const encodedUserId = localStorage.getItem("userId");
                        const userID = parseInt(atob(encodedUserId), 10);
                        const response = await axiosClient.post("/comments/create", {
                                content: commentReply,
                                videoId: videoID,
                                userId: userID,
                                parentCommentId: parentCommentId,
                        });
                        // Thêm phản hồi mới vào mảng replies
                        const newComment = response.data[0];
                        const updatedComments = [...comments];
                        console.log('comment mới thêm vào: ', updatedComments[index]);
                        if (updatedComments[index].repliesLength == 0) {
                                updatedComments[index].replies = [newComment];
                                console.log('lenght bang 0');
                        } else {
                                updatedComments[index].replies = [newComment, ...updatedComments[index].replies];
                                console.log('lenght # 0');
                        }
                        // nếu chưa có comment thì phải bật cái mà hiển thị các phản hồi 
                        if (!updatedComments[index].isCommentReply) {
                                console.log('lỗi chỗ cờ có comment');
                                updatedComments[index].isCommentReply = !updatedComments[index].isCommentReply;
                                console.log('ko lỗi chỗ cờ có comment');
                        }
                        updatedComments[index].repliesLength = updatedComments[index].replies.length;
                        // handleToggleReplies(index, parentCommentId);
                        setComments(updatedComments);

                        setCommentReply("");
                        console.log('reply comment: ', newComment);
                } catch (error) {
                        console.error("Error adding comment reply:", error);
                }
        };

        // delete comment
        const handleDeleteComment = async () => {
                try {
                        const commentId = commentID;
                        const index = commentIndexDelete;
                        const indexReply = replyIndexDelete;
                        const isComment = isCommetDelete;
                        console.log('delete comment');
                        console.log('index: ', index);
                        console.log('indexReply: ', indexReply);
                        console.log('isComment: ', isComment);
                        const response = await axiosClient.delete(`/comments/${commentId}`);
                        console.log('xóa comment: ', commentId);
                        if (response.data === "Đánh dấu xóa thành công") {
                                if (isComment) {
                                        const updatedComments = [...comments];
                                        updatedComments.splice(index, 1); // Xóa 1 phần tử ở vị trí index          
                                        setComments(updatedComments);
                                        console.log('xóa comment, update comment: ', updatedComments);
                                } else {
                                        const updatedComments = [...comments];
                                        updatedComments[index].replies.splice(indexReply, 1);
                                        if (updatedComments[index].repliesLength == 0 || updatedComments[index].repliesLength == 1) {
                                                updatedComments[index].repliesLength = 0;
                                                updatedComments[index].isCommentReply = false;
                                                updatedComments[index].showInputReply = false;
                                        } else {
                                                updatedComments[index].repliesLength = updatedComments[index].repliesLength - 1;
                                        }
                                        setComments(updatedComments);
                                        console.log('xóa comment, update comment: ', updatedComments);
                                }
                        } else {
                                console.error("Failed to delete comment");
                        }
                } catch (error) {
                        console.error("Error deleting comment:", error);
                }
        };

        // modal delete comment & reply
        const [commentID, setCommentID] = useState();
        const [commentIndexDelete, setCommentIndexDelete] = useState();
        const [replyIndexDelete, setReplyIndexDelete] = useState();
        const [isCommetDelete, setIsComment] = useState(true);
        const [modalDeleteCommentIsOpen, setIsModalDeleteCommentOpen] = useState(false);

        const openModalDeleteComment = () => {
                setIsModalDeleteCommentOpen(true);
        }

        function closeModalDeleteComment() {
                setIsModalDeleteCommentOpen(false);
        }


        // modal edit comment 
        const [modalEditCommentIsOpen, setIsModalEditCommentOpen] = useState(false);

        const openModalEditComment = () => {
                setIsModalEditCommentOpen(true);
        }

        function closeModalEditComment() {
                setIsModalEditCommentOpen(false);
        }

        const [editedComment, setEditedComment] = useState("");
        const [editedCommentID, setEditedCommentID] = useState("");
        const handleEditComment = async () => {
                try {
                        const response = await axiosClient.patch(`/comments/${editedCommentID}`, {
                                content: editedComment,
                        });

                        if (response.data) {
                                const updatedComments = comments.map((comment) =>
                                        comment.commentId === editedCommentID
                                                ? { ...comment, content: editedComment }
                                                : comment
                                );
                                setComments(updatedComments);

                                setEditedCommentID(null);
                                setEditedComment("");
                        } else {
                                console.error("Failed to edit comment");
                        }
                } catch (error) {
                        console.error("Error editing comment:", error);
                }
        };

        // modal edit reply 
        const [modalEditReplyIsOpen, setIsModalEditReplyOpen] = useState(false);
        const [indexComment, setIndexComment] = useState();
        const [indexCommentReply, setIndexCommentReply] = useState();
        const openModalEditReply = () => {
                setIsModalEditReplyOpen(true);
        }

        function closeModalEditReply() {
                setIsModalEditReplyOpen(false);
        }
        const handleEditCommentReply = async () => {
                try {
                        const response = await axiosClient.patch(`/comments/${editedCommentID}`, {
                                content: editedComment,
                        });
                        console.log('index comment: ', indexComment);
                        console.log('index reply comment: ', indexCommentReply);
                        if (response.data) {
                                const updatedComments = [...comments];
                                if (updatedComments.length > indexComment && updatedComments[indexComment].replies.length > indexCommentReply) {
                                        console.log('if chính sửa lại');
                                        updatedComments[indexComment].replies[indexCommentReply].content = response.data.content;
                                }
                                setComments(updatedComments);

                                setEditedCommentID(null);
                                setEditedComment("");
                                setIndexComment();
                                setIndexCommentReply();
                        } else {
                                console.error("Failed to edit comment reply");
                        }
                } catch (error) {
                        console.error("Error editing comment reply:", error);
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
                        const response = await axiosClient.get(`/scores/check-score?userId=${userId}&examId=${examID}`);
                        console.log('check score: ', response.data);
                        if (response.data == true) {
                                // 
                                trackExamProgress();
                                updateProgressExam();
                        }
                }
                catch (error) {
                        console.error("Error loading comment:", error);
                }
        }

        const trackExamProgress = async () => {
                console.log("trackingProgress");
                try {
                        const userIdLocal = localStorage.getItem("userId");
                        if (userIdLocal) {
                                const userId = parseInt(atob(userIdLocal), 10);
                                // hàm này sẽ kiểm tra trong cái bảng score nếu có điểm số >= 8 thì thêm vào
                                const responseTrackProgress = await axiosClient.post("/examprogress", {
                                        userId: userId,
                                        examId: examID
                                });
                                if (responseTrackProgress.status === 201) {
                                        console.log("tracking exam thành công!");
                                }

                        } else {

                        }
                } catch (error) {
                        console.error("Error checking course and video registration:", error);
                }
        }
        const [sectionIndex, setSectionIndex] = useState();
        const [examIndex, setExamIndex] = useState();
        // cập nhật lại phần tử của video đã học thành true trên mảng hiển thị trạng thái 
        const updateProgressExam = async () => {
                try {
                        const updatedSectionData = [...sectionData];

                        updatedSectionData[sectionIndex].exams[examIndex].isExam = true;
                        // Cập nhật state mới với mảng sectionData đã được cập nhật
                        setSectionData(updatedSectionData);

                        updateSumViewed(indexSection);
                } catch (error) {
                        console.error('lỗi cập nhật progress section info!');
                }
        }

        const [titleExam, setTitleExam] = useState('');
        const [indexSection, setIndexSection] = useState('');
        return (
                <div>
                        {/* header */}
                        <Header />
                        {/* title khóa học */}
                        <header className="d-flex justify-content-left py-0 my-0 bg-white " id="topbar">
                                {/* <div className="d-inline-block " style={{ paddingLeft: 50 }}>
                                        <Link to="/" style={{ display: "inline-block" }}>
                                                <img
                                                        className="img-fluid logo"
                                                        alt="logo"
                                                        src={logo}
                                                        style={{ display: "block" }}
                                                />
                                        </Link>
                                </div> */}
                                <p className='card-text' style={{ fontSize: '1.25em', fontWeight: 'bold', paddingLeft: 25 }}>{overviewData.title}</p>
                        </header>
                        {/* content */}
                        <div style={{ display: 'flex', height: '100vh', flexDirection: 'row' }}>
                                <div style={{ backgroundColor: 'white', height: '100%', width: '75%', }}>

                                        <div style={{ height: '65%', backgroundColor: 'black' }}>
                                                <iframe
                                                        style={{ height: '100%', width: '100%' }}
                                                        src={videoURL}
                                                        allowFullScreen
                                                        title={titleVideo}
                                                        sandbox="allow-same-origin allow-scripts"
                                                ></iframe></div>
                                        <div style={{}}>

                                                {/* selected option */}
                                                <div className='flex-row pb-0 mb-0'>
                                                        <button className='btn' onClick={() => setSelectedOption('overview')}>
                                                                <p className='pb-0 mb-0' style={{ fontWeight: 'bold', color: selectedOption === 'overview' ? 'black' : 'gray', fontSize: '1.125rem', padding: 10, ':hover': { color: 'black' } }}> Tổng quan</p>
                                                                {selectedOption === 'overview' && <hr style={{ backgroundColor: 'black', width: '100%', border: 'none', borderBottom: '2px solid black', margin: 0 }} />}
                                                        </button>
                                                        <button className='btn' onClick={() => setSelectedOption('description')}>
                                                                <p className='pb-0 mb-0' style={{ fontWeight: 'bold', color: selectedOption === 'description' ? 'black' : 'gray', fontSize: '1.125rem', padding: 10, paddingLeft: 20, paddingRight: 20, ':hover': { color: 'black' } }}> Mô tả</p>
                                                                {selectedOption === 'description' && <hr style={{ backgroundColor: 'black', width: '100%', border: 'none', borderBottom: '2px solid black', margin: 0 }} />}
                                                        </button>
                                                        <button className='btn' onClick={() => setSelectedOption('comment')}>
                                                                <p className='pb-0 mb-0' style={{ fontWeight: 'bold', color: selectedOption === 'comment' ? 'black' : 'gray', fontSize: '1.125rem', padding: 10, paddingLeft: 20, paddingRight: 20, ':hover': { color: 'black' } }}> Hỏi đáp</p>
                                                                {selectedOption === 'comment' && <hr style={{ backgroundColor: 'black', width: '100%', border: 'none', borderBottom: '2px solid black', margin: 0 }} />}
                                                        </button>
                                                        <button className='btn' onClick={() => setSelectedOption('review')}>
                                                                <p className='pb-0 mb-0' style={{ fontWeight: 'bold', color: selectedOption === 'review' ? 'black' : 'gray', fontSize: '1.125rem', padding: 10, paddingLeft: 20, paddingRight: 20, ':hover': { color: 'black' } }}> Đánh giá</p>
                                                                {selectedOption === 'review' && <hr style={{ backgroundColor: 'black', width: '100%', border: 'none', borderBottom: '2px solid black', margin: 0 }} />}
                                                        </button>
                                                        <button className='btn' onClick={() => setSelectedOption('document')}>
                                                                <p className='pb-0 mb-0' style={{ fontWeight: 'bold', color: selectedOption === 'document' ? 'black' : 'gray', fontSize: '1.125rem', padding: 10, ':hover': { color: 'black' } }}> Tài liệu</p>
                                                                {selectedOption === 'document' && <hr style={{ backgroundColor: 'black', width: '100%', border: 'none', borderBottom: '2px solid black', margin: 0 }} />}
                                                        </button>
                                                </div>

                                                <hr className='pt-0 mt-0' />
                                                {/* content selected option */}
                                                <div>
                                                        <p>
                                                                {/* overview */}
                                                                {selectedOption === 'overview' && (
                                                                        <div>
                                                                                <p style={{ color: 'black', fontSize: '1.25rem', fontWeight: 'bold', padding: 10 }}>Giới thiệu về khóa học</p>
                                                                                <p style={{ padding: 10, fontWeight: '500' }}>{overviewData.description}</p>
                                                                                <hr></hr>
                                                                                <div style={{ padding: 10 }}>
                                                                                        {/* Số liệu */}
                                                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                                                <p style={{ marginRight: 10 }}>Theo số liệu</p>
                                                                                                <div style={{ marginLeft: 150 }}>
                                                                                                        <p>Bài giảng: {overviewData.numberOfVideos}</p>
                                                                                                        {overviewData.totalDuration && (
                                                                                                                <p>Video: Tổng số {parseFloat(overviewData.totalDuration).toFixed(2)} giờ</p>
                                                                                                        )}

                                                                                                </div>
                                                                                        </div>
                                                                                        <hr />
                                                                                        {/* Bạn sẽ học được */}
                                                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                                                <p style={{ marginRight: 10 }}>Bạn sẽ học được</p>
                                                                                                <div style={{ marginLeft: 105 }}>
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



                                                                                <hr></hr>
                                                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                                                        <p style={{ padding: 10, flexShrink: 0 }}>Tóm tắt</p>
                                                                                        <div style={{ marginLeft: 180, marginRight: 110 }}>
                                                                                                {isExpanded ? (
                                                                                                        <p dangerouslySetInnerHTML={{ __html: overviewData.introduce }} />
                                                                                                ) : (
                                                                                                        overviewData.introduce && <p dangerouslySetInnerHTML={{ __html: overviewData.introduce.slice(0, 500) + '...' }} />
                                                                                                )}
                                                                                                {!isExpanded ? (
                                                                                                        <button className='btn btn-link pt-0 mt-0' onClick={handleToggleExpand}>
                                                                                                                Xem thêm
                                                                                                        </button>
                                                                                                ) : (
                                                                                                        <button className='btn btn-link pt-0 mt-0' onClick={handleToggleExpand}>
                                                                                                                Thu gọn
                                                                                                        </button>
                                                                                                )}

                                                                                        </div>
                                                                                </div>


                                                                        </div>
                                                                )}
                                                                {/* description */}
                                                                {selectedOption === 'description' && (
                                                                        <div>
                                                                                {lessionData?.[lessionIndex]?.description}
                                                                        </div>
                                                                )}
                                                                {/* comment */}
                                                                {selectedOption === 'comment' && (
                                                                        <div >
                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}>
                                                                                        <div style={{ width: '100%', paddingLeft: 100, display: 'flex', flexDirection: 'row', paddingTop: 20, paddingBottom: 30 }}>
                                                                                                <img
                                                                                                        src={userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/694px-Unknown_person.jpg'}
                                                                                                        alt="Avatar"
                                                                                                        className="avatar"
                                                                                                        style={{ width: '35px', height: '35px' }}
                                                                                                />
                                                                                                <input
                                                                                                        style={{
                                                                                                                borderRadius: '0.25rem',
                                                                                                                backgroundColor: '#f3f4f6', // Màu xám nhạt
                                                                                                                // border: '1px solid #cbd5e0', // Viền xám
                                                                                                                padding: '0.5rem', // Khoảng cách lề bên trong
                                                                                                                width: '50%', // Độ rộng 100%
                                                                                                                boxSizing: 'border-box', // Tính cả border và padding vào kích thước
                                                                                                        }}
                                                                                                        onFocus={() => setShowButtonInput(true)} // Hiển thị button khi focus vào input
                                                                                                        // onBlur={() => setShowButtonInput(false)}
                                                                                                        value={commentInput}
                                                                                                        onChange={e => setCommentInput(e.target.value)}
                                                                                                        placeholder="Viết bình luận... "
                                                                                                />


                                                                                        </div>
                                                                                        {showButtonInput && (
                                                                                                <>
                                                                                                        <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'end', alignItems: 'end', justifyContent: 'center', width: '100%' }}>
                                                                                                                <button
                                                                                                                        className='btn btn-light'
                                                                                                                        onClick={() => {
                                                                                                                                setShowButtonInput(false)
                                                                                                                        }}>
                                                                                                                        Hủy
                                                                                                                </button>
                                                                                                                <button
                                                                                                                        className='btn btn-primary mx-3'
                                                                                                                        onClick={() => {
                                                                                                                                handleAddComment();
                                                                                                                                setShowButtonInput(false);
                                                                                                                        }}>
                                                                                                                        Bình luận
                                                                                                                </button>

                                                                                                        </div>
                                                                                                </>
                                                                                        )}
                                                                                        {comments.length > 0 ? (
                                                                                                comments.map((comment, index) => (
                                                                                                        <div key={index} style={{ paddingLeft: 50 }}>
                                                                                                                <div>
                                                                                                                        <div style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}>
                                                                                                                                <img
                                                                                                                                        src={comment.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/694px-Unknown_person.jpg'}
                                                                                                                                        alt="Avatar"
                                                                                                                                        className="avatar"
                                                                                                                                        style={{ width: '35px', height: '35px' }}
                                                                                                                                />
                                                                                                                                <div>
                                                                                                                                        <div className='d-flex flex-row pb-0 mb-0 '>
                                                                                                                                                <p className='pb-0 mb-0' style={{ fontWeight: 'bold', fontSize: '15px' }}>{comment.fullname}</p>

                                                                                                                                                {comment.userId == userID && (
                                                                                                                                                        <>
                                                                                                                                                                <FontAwesomeIcon
                                                                                                                                                                        icon={faPencil}
                                                                                                                                                                        onClick={() => {
                                                                                                                                                                                openModalEditComment();
                                                                                                                                                                                setEditedComment(comment.content);
                                                                                                                                                                                setEditedCommentID(comment.commentId);
                                                                                                                                                                        }}
                                                                                                                                                                        size="sm"
                                                                                                                                                                        style={{ paddingLeft: 15 }}
                                                                                                                                                                        color='gray'

                                                                                                                                                                />
                                                                                                                                                                <FontAwesomeIcon
                                                                                                                                                                        icon={faTrash}
                                                                                                                                                                        onClick={() => {
                                                                                                                                                                                setCommentID(comment.commentId);
                                                                                                                                                                                setCommentIndexDelete(index);
                                                                                                                                                                                setReplyIndexDelete(0);
                                                                                                                                                                                setIsComment(true);
                                                                                                                                                                                openModalDeleteComment();
                                                                                                                                                                        }}
                                                                                                                                                                        size="sm"
                                                                                                                                                                        style={{ paddingLeft: 15 }}
                                                                                                                                                                        color='gray'
                                                                                                                                                                />
                                                                                                                                                        </>
                                                                                                                                                )}

                                                                                                                                        </div>
                                                                                                                                        <p className='pb-1 mb-0 pt-0 mt-0' style={{ width: '80vh', maxWidth: '80vh', wordWrap: 'break-word' }}>
                                                                                                                                                {comment.content}
                                                                                                                                        </p>
                                                                                                                                        <div className="d-flex justify-content-left align-items-center py-0 my-0 ">
                                                                                                                                                <p className='py-0 my-0' style={{ fontSize: '0.8em', fontWeight: 'bold', color: 'gray' }}>
                                                                                                                                                        {formatTimeAgo(comment.create)}
                                                                                                                                                </p>
                                                                                                                                                <button className='btn btn-link py-0 my-0' onClick={() => { handleToggleInputReply(index); handleToggleReplies(index, comment.commentId); }}>
                                                                                                                                                        <p className='py-0 my-0' style={{ fontSize: '0.8em', fontWeight: 'bold', color: 'gray', paddingLeft: 10 }}> Phản hồi</p>
                                                                                                                                                </button>
                                                                                                                                        </div>

                                                                                                                                </div>

                                                                                                                        </div>

                                                                                                                        <hr className='py-0 my-0'></hr>
                                                                                                                        {comment.isCommentReply && (
                                                                                                                                <button className='btn btn-link py-0 my-0' onClick={() => {
                                                                                                                                        handleToggleReplies(index, comment.commentId);
                                                                                                                                        // handleToggleInputReply(index)
                                                                                                                                }}>
                                                                                                                                        {comment.showReplies ? (
                                                                                                                                                <div className='py-0 my-0' style={{ paddingLeft: 20, display: 'flex', flexDirection: 'row' }}>
                                                                                                                                                        <FontAwesomeIcon icon={faChevronUp} size='small' color='gray' />
                                                                                                                                                        <p className='py-0 my-0' style={{ color: 'gray', paddingBottom: 2, fontSize: '15px', paddingLeft: 5 }}>Ẩn {comment.repliesLength} phản hồi</p>
                                                                                                                                                </div>
                                                                                                                                        ) : (
                                                                                                                                                <div className='py-0 my-0' style={{ paddingLeft: 20, display: 'flex', flexDirection: 'row' }}>
                                                                                                                                                        <FontAwesomeIcon icon={faChevronDown} size='small' color='gray' />
                                                                                                                                                        <p className='py-0 my-0' style={{ color: 'gray', paddingBottom: 2, fontSize: '15px', paddingLeft: 5 }}>Xem {comment.repliesLength} phản hồi</p>
                                                                                                                                                </div>
                                                                                                                                        )}
                                                                                                                                </button>
                                                                                                                        )}
                                                                                                                        {comment.showInputReply && (<>
                                                                                                                                <div className='py-0 my-0' style={{ padding: 5, paddingLeft: 30, display: 'flex', flexDirection: 'row' }} >
                                                                                                                                        <input
                                                                                                                                                className='py-0 my-0'
                                                                                                                                                style={{
                                                                                                                                                        borderRadius: '0.25rem',
                                                                                                                                                        backgroundColor: '#f3f4f6', // Màu xám nhạt
                                                                                                                                                        border: '1px solid #cbd5e0', // Viền xám
                                                                                                                                                        padding: '0.5rem', // Khoảng cách lề bên trong
                                                                                                                                                        width: '50%', // Độ rộng 100%
                                                                                                                                                        boxSizing: 'border-box', // Tính cả border và padding vào kích thước
                                                                                                                                                }}
                                                                                                                                                value={commentReply}
                                                                                                                                                onChange={e => setCommentReply(e.target.value)}
                                                                                                                                                placeholder="Bình luận của bạn... "
                                                                                                                                        />

                                                                                                                                        <button
                                                                                                                                                className='btn btn-light'
                                                                                                                                                onClick={() => {
                                                                                                                                                        handleAddReply(comment.commentId, index);
                                                                                                                                                        handleToggleInputReply(index);
                                                                                                                                                }}
                                                                                                                                        >
                                                                                                                                                Gửi

                                                                                                                                        </button>
                                                                                                                                        <button className='btn btn-light' onClick={() => handleToggleInputReply(index)}>
                                                                                                                                                X
                                                                                                                                        </button>
                                                                                                                                </div>
                                                                                                                        </>)}
                                                                                                                        {comment.replies && comment.showReplies && comment.replies.length > 0 && (
                                                                                                                                <>
                                                                                                                                        <div className='py-0 my-0' style={{ paddingLeft: 20 }}>
                                                                                                                                                {comment.replies.map((reply, replyIndex) => (
                                                                                                                                                        <div key={replyIndex}>
                                                                                                                                                                <div className='py-0 my-0' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                                                                                                                                                                        <img
                                                                                                                                                                                src={reply.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/694px-Unknown_person.jpg'}
                                                                                                                                                                                alt="Avatar"
                                                                                                                                                                                className="avatar"
                                                                                                                                                                                style={{ width: '35px', height: '35px' }}
                                                                                                                                                                        />
                                                                                                                                                                        <div className='py-0 my-0' style={{ paddingLeft: 10, width: '80%' }}>
                                                                                                                                                                                <div className='py-0 my-0' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                                                                                                                                        <p className='pb-0 mb-0' style={{ fontWeight: 'bold', fontSize: '15px' }}>{comment.fullname}</p>
                                                                                                                                                                                        <p className='pb-0 mb-0' style={{ fontSize: '0.8em', fontWeight: 'bold', color: 'gray', paddingLeft: 10 }}>
                                                                                                                                                                                                {formatTimeAgo(reply.create)}
                                                                                                                                                                                        </p>

                                                                                                                                                                                        {/* chỉnh sửa phản hồi */}
                                                                                                                                                                                        {reply.userId == userID && (
                                                                                                                                                                                                <>
                                                                                                                                                                                                        <FontAwesomeIcon
                                                                                                                                                                                                                icon={faPencil}
                                                                                                                                                                                                                size="sm"
                                                                                                                                                                                                                style={{ paddingLeft: 15 }}
                                                                                                                                                                                                                color='gray'
                                                                                                                                                                                                                onClick={() => {
                                                                                                                                                                                                                        setEditedComment(reply.content);
                                                                                                                                                                                                                        setEditedCommentID(reply.commentId);
                                                                                                                                                                                                                        setIndexComment(index)
                                                                                                                                                                                                                        setIndexCommentReply(replyIndex);
                                                                                                                                                                                                                        openModalEditReply();
                                                                                                                                                                                                                        // setIsModalReplyVisible(true);
                                                                                                                                                                                                                }}
                                                                                                                                                                                                        />
                                                                                                                                                                                                        <FontAwesomeIcon
                                                                                                                                                                                                                size="sm"
                                                                                                                                                                                                                style={{ paddingLeft: 15 }}
                                                                                                                                                                                                                color='gray'
                                                                                                                                                                                                                icon={faTrash}
                                                                                                                                                                                                                onClick={() => {
                                                                                                                                                                                                                        setCommentID(comment.commentId);
                                                                                                                                                                                                                        setCommentIndexDelete(index);
                                                                                                                                                                                                                        setReplyIndexDelete(replyIndex);
                                                                                                                                                                                                                        setIsComment(false);
                                                                                                                                                                                                                        openModalDeleteComment();
                                                                                                                                                                                                                }}
                                                                                                                                                                                                        />
                                                                                                                                                                                                </>
                                                                                                                                                                                        )}
                                                                                                                                                                                </div>
                                                                                                                                                                                <p className='py-0 my-0' style={{ width: '80vh', maxWidth: '80vh', wordWrap: 'break-word' }}>
                                                                                                                                                                                        {reply.content}
                                                                                                                                                                                </p>

                                                                                                                                                                        </div>
                                                                                                                                                                </div>

                                                                                                                                                                <hr className='py-0 my-0' />

                                                                                                                                                        </div>

                                                                                                                                                ))}
                                                                                                                                        </div>


                                                                                                                                </>
                                                                                                                        )}

                                                                                                                </div>
                                                                                                        </div>
                                                                                                ))
                                                                                        ) : (<p style={{ padding: 10 }}></p>)}


                                                                                </div>

                                                                        </div>
                                                                )}
                                                                {/* review */}
                                                                {selectedOption === 'review' && (
                                                                        <div >
                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                        <p style={{ fontWeight: 'bold', fontSize: '1.5em' }}>⭐{overviewData.rating} xếp hạng khóa học <span style={{ color: 'gray' }}>&bull;</span> {reviewData.length} xếp hạng</p>
                                                                                </div>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                                                        {reviewData.length > 0 ? (
                                                                                                reviewData.map((review, index) => (
                                                                                                        <div key={index} >
                                                                                                                <div>
                                                                                                                        <div style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}>
                                                                                                                                <img
                                                                                                                                        src={review.avatar || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/694px-Unknown_person.jpg'}
                                                                                                                                        alt="Avatar"
                                                                                                                                        className="avatar"
                                                                                                                                        style={{ width: '35px', height: '35px' }}
                                                                                                                                />
                                                                                                                                <div>
                                                                                                                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                                                                                                                <p className='py-0 my-0' style={{ fontWeight: 'bold' }}>{review.fullname}</p>

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
                                                                                                                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                                                                                        {!isReviewed && (
                                                                                                <button onClick={openModalAddReview} style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
                                                                                                        Đánh giá
                                                                                                </button>
                                                                                        )}


                                                                                </div>

                                                                        </div>
                                                                )}
                                                                {/* document */}
                                                                {selectedOption === 'document' && (
                                                                        <div>
                                                                                {/* Hiển thị nội dung của tài liệu */}
                                                                                {documentData.length > 0 ? (
                                                                                        documentData.map((document, index) => (
                                                                                                <div key={index} >
                                                                                                        <div style={{ padding: 10 }}>
                                                                                                                <div>
                                                                                                                        <p style={{ fontWeight: 'bold', color: 'black' }}>{document.title}</p>
                                                                                                                        <a href={document.file_path} target="_blank" style={{ textDecoration: 'underline', color: 'blue' }}>{document.file_path}</a>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                        <div className="border-b border-black w-full mt-1 mb-1 opacity-20" />
                                                                                                </div>
                                                                                        ))
                                                                                ) : (<p style={{ padding: 10 }}> Chưa có tài liệu nào. </p>)}
                                                                        </div>
                                                                )}
                                                        </p>
                                                </div>
                                        </div>
                                </div>
                                {/* lession list */}
                                <div style={{ height: '100%', width: '25%' }}>
                                        <p style={{ fontWeight: 'bold', padding: 20, fontSize: '18px' }}>Nội dung khóa học</p>
                                        <hr />
                                        {sectionData && (
                                                sectionData.map((section, sectionIndex) => (
                                                        <div key={sectionIndex}>
                                                                <button
                                                                        className='btn btn-light'
                                                                        style={{ backgroundColor: 'rgb(227, 243, 253)', width: '100%', padding: 10 }}
                                                                        onClick={() => {
                                                                                console.log('section DATA: ', sectionData);
                                                                                // Toggle trạng thái mở rộng/collapse khi người dùng nhấp vào tiêu đề phần
                                                                                // Tạo một bản sao của mảng sectionData để tránh thay đổi trực tiếp trên state
                                                                                const updatedSectionData = [...sectionData];
                                                                                // Toggle trạng thái isShowVideo của section tương ứng khi người dùng click
                                                                                updatedSectionData[sectionIndex] = {
                                                                                        ...section,
                                                                                        isShowVideo: !section.isShowVideo
                                                                                };
                                                                                // Cập nhật state mới với mảng sectionData đã được cập nhật
                                                                                setSectionData(updatedSectionData);
                                                                        }}>
                                                                        <p className='py-0 my-0' style={{ fontWeight: 'bold', paddingLeft: 10, textAlign: 'left' }}
                                                                        ><FontAwesomeIcon icon={faChevronDown} /> Phần {sectionIndex + 1}. {section.sectionName} {section.isShowVideo}     </p>
                                                                        <p className='py-0 my-0' style={{ textAlign: 'left', paddingLeft: 15, fontSize: '14px' }}> {sectionInfo[sectionIndex]?.sumViewed}/{sectionInfo[sectionIndex]?.sumVideo} - {sectionInfo[sectionIndex]?.sumTime} phút</p>
                                                                </button>
                                                                {section.isShowVideo.toString() === "true" && (<>
                                                                        {section.videos.map((video, index) => (
                                                                                <div key={index}>
                                                                                        {/* Hiển thị thông tin của từng video */}
                                                                                        <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 5, paddingTop: 10, backgroundColor: video.indexArray === lessionIndex ? 'rgb(220, 220, 220)' : 'white', }}>
                                                                                                {
                                                                                                        progressVideo.length > 0 && progressVideo[video.indexArray] ? (
                                                                                                                <div style={{ display: 'flex', paddingRight: 10, paddingLeft: 10, opacity: '75%' }}>
                                                                                                                        <FontAwesomeIcon icon={faCheckSquare} color='gray' size="lg" />
                                                                                                                </div>
                                                                                                        ) : (
                                                                                                                <div style={{ display: 'flex', paddingRight: 10, paddingLeft: 10, opacity: '25%' }}>
                                                                                                                        <FontAwesomeIcon icon={faSquare} color='gray' size="lg" />
                                                                                                                </div>
                                                                                                        )
                                                                                                }

                                                                                                <div
                                                                                                        onClick={() => {
                                                                                                                if (video.indexArray !== lessionIndex) {
                                                                                                                        setLessionIndex(video.indexArray);  // để tô màu video đang xem
                                                                                                                        setTitleVideo(lessionData[video.indexArray].title);
                                                                                                                        setVideoURL(processVideoLink(lessionData[video.indexArray].video_filepath));
                                                                                                                        loadCommentData(video.videoId);
                                                                                                                        setVideoID(video.videoId);
                                                                                                                        trackProgress(video.videoId);
                                                                                                                        updateProgressVideo(video.indexArray);
                                                                                                                        updateSumViewed(sectionIndex);
                                                                                                                        console.log(video.videoId);
                                                                                                                }
                                                                                                        }}
                                                                                                >
                                                                                                        <p className='py-0 my-0' style={{ fontSize: '14px', textAlign: 'left' }}>{index + 1}. {video.title}</p>
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
                                                                        {section.exams.map((exam, index) => (
                                                                                <div key={index}>
                                                                                        {/* Hiển thị thông tin của từng exam */}
                                                                                        <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 5, paddingTop: 10, backgroundColor: 'rgb(217, 238, 225)', }}>
                                                                                                {
                                                                                                        exam.isExam ? (
                                                                                                                <div style={{ display: 'flex', paddingRight: 10, paddingLeft: 10, opacity: '75%' }}>
                                                                                                                        <FontAwesomeIcon icon={faCheckSquare} color='gray' size="lg" />
                                                                                                                </div>
                                                                                                        ) : (
                                                                                                                <div style={{ display: 'flex', paddingRight: 10, paddingLeft: 10, opacity: '25%' }}>
                                                                                                                        <FontAwesomeIcon icon={faSquare} color='gray' size="lg" />
                                                                                                                </div>
                                                                                                        )
                                                                                                }

                                                                                                <div
                                                                                                        onClick={() => {
                                                                                                                setSectionIndex(sectionIndex);
                                                                                                                setExamIndex(index);
                                                                                                                setIndexSection(sectionIndex);
                                                                                                                // updateProgressExam(sectionIndex, index);
                                                                                                                console.log("id exam: ", exam.id);
                                                                                                                setTitleExam(exam.name);
                                                                                                                openModalResultExam(exam.id);
                                                                                                        }}>
                                                                                                        <p className='py-0 my-0' style={{ fontSize: '14px', textAlign: 'left' }}><span style={{ fontWeight: 'bold' }}>Kiểm tra</span> {exam.name}</p>
                                                                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                                                                <p className='py-0 my-0' style={{ fontSize: '14px', paddingLeft: 5, color: 'gray' }}>Thời gian: {exam.time} </p>
                                                                                                                <p className='py-0 my-0' style={{ fontSize: '14px', paddingLeft: 5, color: 'gray' }}>- {exam.count_question} câu hỏi</p>

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
                        {/* delete modal comment & reply*/}
                        <Modal
                                isOpen={modalDeleteCommentIsOpen}
                                onAfterOpen={afterOpenModal}
                                onRequestClose={closeModalDeleteComment}
                                style={customStyles}
                                contentLabel="Example Modal"
                        >
                                <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
                                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Thông báo</h2>
                                        <FontAwesomeIcon
                                                icon={faClose}
                                                onClick={closeModalDeleteComment}
                                        />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                                        <p>Bạn có chắc chắc muốn xóa bình luận này không?</p>
                                </div>


                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                                        <button
                                                onClick={() => {
                                                        closeModalDeleteComment();
                                                        handleDeleteComment();
                                                }}
                                                style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
                                                Xóa
                                        </button>
                                        <button
                                                onClick={() => {
                                                        closeModalDeleteComment();
                                                }}
                                                style={{ marginLeft: 50, width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
                                                Thoát
                                        </button>
                                </div>
                        </Modal>
                        {/* edit modal comment */}
                        <Modal
                                isOpen={modalEditCommentIsOpen}
                                onAfterOpen={afterOpenModal}
                                onRequestClose={closeModalEditComment}
                                style={customStyles}
                                contentLabel="Example Modal"
                        >
                                <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
                                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Chỉnh sửa</h2>
                                        <FontAwesomeIcon
                                                icon={faClose}
                                                onClick={closeModalEditComment}
                                        />
                                </div>

                                <div style={{ width: '350px', paddingTop: 10 }}>
                                        <textarea
                                                style={{ width: '350px', borderWidth: '0.2px', paddingLeft: '5px', minHeight: '80px', fontSize: '14px' }}
                                                value={editedComment}
                                                onChange={e => setEditedComment(e.target.value)}
                                                placeholder="Đánh giá của bạn..."
                                        />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                        <button
                                                onClick={() => {
                                                        closeModalEditComment();
                                                        handleEditComment();
                                                }}
                                                style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
                                                Cập nhật
                                        </button>
                                </div>
                        </Modal>
                        {/* edit modal reply */}
                        <Modal
                                isOpen={modalEditReplyIsOpen}
                                onAfterOpen={afterOpenModal}
                                onRequestClose={closeModalEditReply}
                                style={customStyles}
                                contentLabel="Example Modal"
                        >
                                <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1' }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
                                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                        <h2 style={{ fontWeight: 'bold', color: 'black', flex: '1', fontSize: '1.25em' }} >Chỉnh sửa</h2>
                                        <FontAwesomeIcon
                                                icon={faClose}
                                                onClick={closeModalEditReply}
                                        />
                                </div>

                                <div style={{ width: '350px', paddingTop: 10 }}>
                                        <textarea
                                                style={{ width: '350px', borderWidth: '0.2px', paddingLeft: '5px', minHeight: '80px', fontSize: '14px' }}
                                                value={editedComment}
                                                onChange={e => setEditedComment(e.target.value)}
                                                placeholder="Đánh giá của bạn..."
                                        />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                        <button
                                                onClick={() => {
                                                        closeModalEditReply();
                                                        handleEditCommentReply();
                                                }}
                                                style={{ width: '30%', padding: '10px', marginTop: '5px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
                                                Cập nhật
                                        </button>
                                </div>
                        </Modal>
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
                                                justifyContent: "center"
                                        },
                                        content: {
                                                top: '45%',
                                                left: '50%',
                                                right: 'auto',
                                                bottom: 'auto',
                                                marginRight: '-50%',
                                                transform: 'translate(-50%, -50%)',
                                                height: '85%',
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
                                <h2 style={{ fontWeight: "bold", color: "black", flex: "1" }} ref={(_subtitle) => (subtitle = _subtitle)}></h2>
                                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", }}>
                                        <h2 style={{ fontWeight: "bold", color: "black", flex: "1", fontSize: "1.25em" }}>{titleExam}</h2>
                                        <FontAwesomeIcon
                                                icon={faClose}
                                                onClick={closeModalResultExam}
                                        />
                                </div>
                                <div style={{ backgroundColor: '', width: '100%', alignItems: "center", justifyContent: "center", paddingTop: 15 }}>
                                        <ResultExam id={examID} />
                                </div>

                        </Modal>
                        {/* footer */}
                </div >
        )
}

export default CourseStudyNetworkSupport;