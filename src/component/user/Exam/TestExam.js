import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import ResultExam from "./ResultExam";

export default function TestExam({ id }) {
  // const { id } = useParams();
  const [examData, setExamData] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [notification, setNotification] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  let timer; // Biến timer để lưu trữ ID của setTimeout

  useEffect(() => {
    let intervalId;
    if (timeLeft === null) return; // Nếu timeLeft là null, không làm gì cả
    if (timeLeft === 1) {
      // Nếu thời gian còn lại bằng 0
      handleTimeOut(); // Gọi hàm xử lý khi hết thời gian
    } else {
      // Nếu thời gian còn lại lớn hơn 0
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(intervalId); // Hủy interval khi component unmount
  }, [timeLeft]);

  const fetchData = async () => {
    try {
      const examData = await axiosClient.get(`/questions/exam=${id}`);
      setExamData(examData.data);
      const convertedTime = convertTimeToSeconds(examData.data[0].time);
      setTimeLeft(convertedTime);
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };

  const convertTimeToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleAnswerChange = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
    });
  };

  const handleTimeOut = async () => {
    setIsTimeOut(true);
    setNotification({
      type: "danger",
      message: "Hết giờ. Bài thi đã kết thúc.",
    });
    countCorrectAnswers();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmitExam = () => {
    countCorrectAnswers();
  };

  const countCorrectAnswers = async () => {
    let correctCount = 0;
    examData.forEach((exam) => {
      const selectedAnswerId = selectedAnswers[exam.question_id];
      if (selectedAnswerId !== undefined) {
        const selectedAnswer = exam.answers.find(
          (answer) => answer.answerId === selectedAnswerId
        );
        if (selectedAnswer && selectedAnswer.correct) {
          correctCount++;
        }
      }
    });

    const totalQuestions = examData.length;
    const score = ((correctCount / totalQuestions) * 10).toFixed(1);
    setPoint(score);
    setTotalQuestion(totalQuestions);
    setCorrectQuestion(correctCount);
    if (!isNaN(score)) {
      // Kiểm tra nếu điểm là một số hợp lệ
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      console.log("Diem", score);
      console.log("User", userId);
      console.log("Exam", id);

      // Parse score as float
      const parsedScore = parseFloat(score);

      const response = await axiosClient.post("/scores", {
        score: parsedScore,
        examId: id,
        userId: userId,
      });
      console.log("exam", response.data);
    } else {
      console.log("Điểm không hợp lệ.");
      // Thực hiện các hành động cần thiết nếu điểm không hợp lệ
    }
    // navigate(`/user/result-exam/${id}`);
    setIsTestExam(false);
    setIsShowResultTest(true);
  };

  const [isTestExam, setIsTestExam] = useState(true);
  const [isShowResultExam, setIsShowResultExam] = useState(false);
  const [isShowResultTest, setIsShowResultTest] = useState(false);
  const handleNavigate = (path) => {
    window.open(path, "_blank");
  };

  const [totalQuestions, setTotalQuestion] = useState(0);
  const [correctQuestions, setCorrectQuestion] = useState(0);
  const [point, setPoint] = useState(0);

  // show panel xác nhận nộp bài
  const [showAlertModal, setShowAlertModal] = useState(false);
  const handleCloseAlertModal = () => setShowAlertModal(false);
  const handleOpenAlertModal = () => setShowAlertModal(true);
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isTestExam && (
        <div className="container" style={{ width: "80%", margin: "auto" }}>
          <div className="row">
            <div className="col-sm-12 col-md-12 col-lg-12">
              <div className="bg-white p-4" id="noidung">                

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Thời gian còn lại: {formatTime(timeLeft)}</span>
                  <button
                    onClick={handleOpenAlertModal}
                    className="btn btn-primary"
                  >
                    Nộp bài
                  </button>
                </div>
                {examData.map((exam, index) => (
                  <div key={exam.question_id} className="border-bottom pb-4">
                    <h4 className="d-flex justify-content-between align-items-center">
                      <span>Câu hỏi {index + 1}</span>
                    </h4>
                    <div className="question mb-3 border p-3">
                      <p>{exam.nameQuestion}</p>
                      {exam.image && (
                        <img
                          src={exam.image}
                          alt="Question"
                          className="img-fluid"
                          style={{
                            maxWidth: "300px",
                            height: "100%",
                            border: "1px solid #ced4da",
                            borderRadius: "5px",
                          }}
                        />
                      )}
                    </div>
                    <div className="answers border p-3">
                      <h5 className="mb-3">Đáp án:</h5>
                      <ul>
                        {exam.answers.map((answer, ansIndex) => (
                          <li
                            key={answer.answerId}
                            className="mb-2"
                            style={{
                              backgroundColor:
                                selectedAnswers[exam.question_id] ===
                                answer.answerId
                                  ? "lightblue"
                                  : "transparent",
                              border: "1px solid #ced4da",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleAnswerChange(
                                exam.question_id,
                                answer.answerId
                              )
                            }
                          >
                            {String.fromCharCode(97 + ansIndex)}.{" "}
                            {answer.context}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {isShowResultExam && (
        <div className="container" style={{ width: "80%", margin: "auto" }}>
        <ResultExam id={id} />
      </div>
      )}
      {isShowResultTest && (
        <div className="container" style={{ width: "80%", margin: "auto" }}>
          <div className="container">
            <div className="row justify-content-center mt-5">
              <div className="col-8">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      Chúc mừng bạn đã hoàn thành bài kiểm tra!
                    </h5>
                    <p className="card-text">
                      Điểm số của bạn là: <strong>{point}</strong>
                      <span className="pl-2">-  {correctQuestions}/{totalQuestions} câu hỏi</span>
                    </p>
                    {point <= 8 ? (<p className="text-danger">Bạn chưa hoàn thành bài kiểm tra!</p>) : (
                      <p className="text-primary">Bạn đã hoàn thành bài kiểm tra này!</p>
                    )}
                    <div className="btn-group" role="group">
                      <button
                        onClick={() => handleNavigate(`/user/see-answer/${id}`)}
                        className="btn btn-primary"
                      >
                        Xem đáp án
                      </button>
                      <button type="button" className="btn btn-secondary"
                      onClick={() => {
                        setIsShowResultExam(true);
                        setIsTestExam(false);
                        setIsShowResultTest(false);
                        }}>
                        Xem lịch sử làm bài
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal thông báo nộp bài */}
      <div
        className="modal"
        tabIndex="-1"
        style={{ display: showAlertModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontWeight: 'bold' }}>Bạn có chắc chắn muốn nộp bài không?</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAlertModal}
              ></button>
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
                onClick={() => {
                  handleSubmitExam();
                  handleCloseAlertModal();
                }}
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
