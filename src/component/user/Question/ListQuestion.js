import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import {
  faTrash,
  faEdit,
  faPlus,
  faSave,
  faClose,
  faBackward,
  faAdd,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
export default function ListQuestion() {
  const { id } = useParams();
  const [nameExam, setNameExam] = useState("");
  const [examData, setExamData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [newQuestionId, setNewQuestionId] = useState("");
  const [newAnswerText, setNewAnswerText] = useState("");
  const [editedQuestionContent, setEditedQuestionContent] = useState({});
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [editedImageSelected, setEditedImageSelected] = useState(null);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [questionID, setQuestionID] = useState("");
  const [answerID, setAnswerID] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // Thêm state để lưu đường dẫn ảnh đã tải lên
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchData();
    fetchNameExam();
  }, [id]);
  const fetchNameExam = async () => {
    try {
      const examData = await axiosClient.get(`/exams/${id}`);
      if (examData.status == 200) {
        setNameExam(examData.data.name);
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };
  const fetchData = async () => {
    try {
      const examData = await axiosClient.get(`/questions/exam=${id}`);
      setExamData(examData.data);
      console.log("question data: ", examData.data);
      // Lấy trạng thái correct của các đáp án
      const correctAnswersData = {};
      examData.data.forEach((question) => {
        question.answers.forEach((answer) => {
          correctAnswersData[answer.answerId] = answer.correct || false;
        });
      });
      setCorrectAnswers(correctAnswersData);
      console.log("correct answer: ", correctAnswersData);
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await axiosClient.delete(`/questions/${questionID}`);

      setNotification({
        type: "success",
        message: "Xóa câu hỏi thành công!",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      fetchData();
    } catch (error) {
      console.error("Error deleting exam:", error);
      setNotification({ type: "error", message: "Error deleting exam" });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleEditQuestion = (questionId, currentContent, currentImageUrl) => {
    setEditingQuestionId(questionId);
    setEditedQuestionContent(currentContent);
    setEditedImageUrl(currentImageUrl);
  };

  const handleSaveQuestion = async (questionId) => {
    try {
      let imageLink = "";
      // Upload the selected image if available
      if (editedImageSelected) {
        const formData = new FormData();
        formData.append("file", editedImageSelected);
        const uploadResponse = await axiosClient.post(
          "cloud/images/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const imageUrlClodinary = uploadResponse.data.data;
        console.log("image update:: ", imageUrlClodinary);
        imageLink = imageUrlClodinary;
      } else if (editedImageUrl) {
        imageLink = editedImageUrl;
      }

      await axiosClient.patch(`/questions/${questionId}`, {
        question: editedQuestionContent,
        image: imageLink, // Sử dụng đường dẫn ảnh đã tải lên nếu không có link ảnh khác được chỉ định
      });
      setNotification({
        type: "success",
        message: "Câu hỏi đã được cập nhật thành công",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      setEditingQuestionId(null);
      setEditedQuestionContent({});
      setEditedImageUrl("");
      fetchData();
    } catch (error) {
      console.error("Error updating question:", error);
      setNotification({ type: "error", message: "Error updating question" });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleEditAnswer = (answerId, currentContext) => {
    setEditingAnswerId(answerId);
    setEditedAnswerContent(currentContext);
  };

  const handleSaveAnswer = async (answerId, questionId, isCorrect) => {
    try {
      setIsLoading(true);

      // Cập nhật câu trả lời được chỉnh sửa
      await axiosClient.patch(`/answers/${answerId}`, {
        context: editedAnswerContent,
        correct: isCorrect,
      });

      // Nếu câu trả lời là đúng, cập nhật các câu trả lời khác cùng câu hỏi là sai
      if (isCorrect) {
        const question = examData.find(
          (exam) => exam.question_id === questionId
        );
        const otherAnswers = question.answers.filter(
          (answer) => answer.answerId !== answerId
        );

        // Tạo một mảng các lời hứa (promise) để cập nhật các câu trả lời khác
        const updatePromises = otherAnswers.map((answer) =>
          axiosClient.patch(`/answers/${answer.answerId}`, { correct: false })
        );

        // Chờ tất cả các yêu cầu cập nhật hoàn thành
        await Promise.all(updatePromises);
      }

      // Cập nhật trạng thái và thông báo sau khi tất cả yêu cầu hoàn thành
      setIsLoading(false);
      setNotification({
        type: "success",
        message: "Đáp án đã được cập nhật thành công",
      });

      // Xóa thông báo sau 5 giây
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      // Đặt lại trạng thái chỉnh sửa
      setEditingAnswerId(null);
      setEditedAnswerContent("");
      fetchData();
    } catch (error) {
      // Xử lý lỗi và cập nhật trạng thái
      setIsLoading(false);
      console.error("Error updating answer:", error);
      setNotification({ type: "error", message: "Error updating answer" });

      // Xóa thông báo sau 5 giây
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleDeleteAnswer = async () => {
    try {
      await axiosClient.delete(`/answers/${answerID}`);

      setNotification({
        type: "success",
        message: "Xóa đáp án thành công",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      fetchData();
    } catch (error) {
      console.error("Error deleting answer:", error);
      setNotification({ type: "error", message: "Error deleting answer" });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  //modal
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

  //add question
  const [modalAddQuestion, setIsModalAddQuestion] = useState(false);

  function openModalAddQuestion() {
    setIsModalAddQuestion(true);
  }
  function closeModalAddQuestion() {
    setIsModalAddQuestion(false);
  }

  //delete question
  const [modalDeleteQuestion, setIsModalDeleteQuestion] = useState(false);

  function openModalDeleteQuestion() {
    setIsModalDeleteQuestion(true);
  }
  function closeModalDeleteQuestion() {
    setIsModalDeleteQuestion(false);
  }

  //delete answer
  const [modalDeleteAnswer, setIsModalDeleteAnswer] = useState(false);

  function openModalDeleteAnswer() {
    setIsModalDeleteAnswer(true);
  }
  function closeModalDeleteAnswer() {
    setIsModalDeleteAnswer(false);
  }

  //delete answer modal true answer
  const [modalDeleteAnswerTrueAnswer, setIsModalDeleteAnswerTrueAnswer] =
    useState(false);

  function openModalDeleteAnswerTrueAnswer() {
    setIsModalDeleteAnswerTrueAnswer(true);
  }
  function closeModalDeleteAnswerTrueAnswer() {
    setIsModalDeleteAnswerTrueAnswer(false);
  }

  const [questionName, setQuestionName] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [error, setError] = useState("");

  const addAnswer = () => {
    if (answerText.trim() !== "") {
      setAnswers([...answers, answerText]);
      if (correctAnswerIndex === null) {
        setCorrectAnswerIndex(answers.length);
      }
      setAnswerText("");
    }
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setSelectedImage(null); // Reset selectedImage when imageUrl is changed
  };

  const handleImageUpload = async (e) => {
    setSelectedImage(e.target.files[0]);
    setImageUrl(""); // Reset imageUrl when an image is uploaded
  };

  const handleImageUploadSelectedEdit = async (e) => {
    setEditedImageSelected(e.target.files[0]);
    setEditedImageUrl(""); // Reset imageUrl when an image is uploaded
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionName.trim() && !imageUrl.trim() && !selectedImage) {
      setError("Bạn phải nhập đường link ảnh hoặc chọn ảnh từ máy");
      return;
    }
    if (answers.length === 0) {
      setError("Phải có ít nhất một câu trả lời");
      return;
    }

    try {
      setLoading(true);
      let imageLink = "";
      // Upload the selected image if available
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        const uploadResponse = await axiosClient.post(
          "cloud/images/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const imageUrlClodinary = uploadResponse.data.data;
        imageLink = imageUrlClodinary;
      } else if (imageUrl) {
        imageLink = imageUrl;
      }

      // kiểm tra trong các đáp án phải có đáp án đúng
      let checkHaveCorrect = false;

      answers.forEach((answer, index) => {
        if (index === correctAnswerIndex) {
          checkHaveCorrect = true;
          return; // Thoát khỏi vòng lặp ngay sau khi tìm thấy chỉ số đúng
        }
      });
      if (!checkHaveCorrect) {
        setError("Câu hỏi phải có một câu trả lời đúng");

        return;
      }
      // Create the question
      const questionResponse = await axiosClient.post("/questions", {
        question: questionName,
        image: imageLink,
        examId: id,
      });
      const questionId = questionResponse.data[0].question_id;

      // Create the answers
      const answerPromises = answers.map(async (answer, index) => {
        const answerResponse = await axiosClient.post("/answers", {
          context: answer,
          correct: index === correctAnswerIndex,
          questionId: questionId,
        });
        console.log("answer", answerResponse.data);
      });
      await Promise.all(answerPromises);
      setSuccessMessage("Đã thêm câu hỏi thành công!");
      fetchData();
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Đã xảy ra lỗi khi tạo câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handAddAnswer = async () => {
    try {
      const trimInput = (value) => value.trim();
      const answerResponse = await axiosClient.post("/answers", {
        context: trimInput(newAnswerText),
        correct: false,
        questionId: newQuestionId,
      });
      console.log("answer", answerResponse.data);
      setNotification({
        type: "success",
        message: "Đã tạo đáp án thành công!",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      fetchData();
    } catch (error) {
      console.error("Error creating question:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi khi tạo đáp án!",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <div>
      <Header />
      <div className="container d-flex justify-content-center align-items-center col-sm-12 col-md-12 col-lg-12 ">
        <div className="col-sm-12 col-md-12 col-lg-12 border-0 shadow rounded-3 p-2 m-2">
          <div className="row align-items-center mb-4">
            <div className="col">
              {/* <p className="small">
                <Link
                  to={`/teacher/course/new-exam/${id}`}
                  rel="noopener noreferrer" // Đảm bảo tính an toàn
                  className="fw-bold text-decoration-none text-blue"
                >
                  <FontAwesomeIcon icon={faBackward} /> Danh sách bài kiểm tra
                </Link>{" "}
              </p> */}
              <h3 className="mb-0 d-inline-block mx-2 px-2">{nameExam}</h3>
              {isLoading ? (
                <div class="spinner-border text-primary ml-5" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className="col-auto">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  openModalAddQuestion();
                  setSuccessMessage("");
                  setError("");
                  setQuestionName("");
                  setAnswerText("");
                  setAnswers([]);
                  setCorrectAnswerIndex("");
                  setImageUrl("");
                  setSelectedImage(null);
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Thêm Câu Hỏi
              </button>
            </div>
          </div>

          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}
          {examData.map((exam, index) => (
            <div key={exam.question_id} className="border-bottom pb-4">
              {/* element new */}
              <div className="border p-2">
                <div className="d-flex justify-content-between align-items-center">
                  {editingQuestionId === exam.question_id ? (
                    <>
                      <input
                        type="text"
                        value={editedQuestionContent}
                        onChange={(e) =>
                          setEditedQuestionContent(e.target.value)
                        }
                        style={{
                          width: "90%",
                          height: "50px",
                          borderRadius: "5px",
                        }}
                        className="border py-2 my-2"
                      />
                    </>
                  ) : (
                    <p>
                      <span className="fw-bold">{index + 1}. </span>{" "}
                      {exam.nameQuestion}
                    </p>
                  )}

                  {/* hiển thị button chỉnh sửa question */}
                  {editingQuestionId === exam.question_id ? (
                    <div>
                      <button
                        className="btn btn-sm btn-primary mx-1"
                        onClick={() => handleSaveQuestion(exam.question_id)}
                      >
                        <FontAwesomeIcon icon={faSave} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger mx-1"
                        onClick={() => {
                          setEditingQuestionId(null);
                          setEditedQuestionContent({});
                          setEditedImageUrl("");
                        }}
                      >
                        <FontAwesomeIcon icon={faClose} />
                      </button>
                      {/* thêm 1 cái cancel chỗ này */}
                    </div>
                  ) : (
                    <div>
                      <button
                        className="btn btn-sm btn-success mx-1"
                        onClick={() => {
                          setNewQuestionId(exam.question_id);
                          setNewAnswerText("");
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                      <button
                        className="btn btn-sm btn-primary mx-1"
                        onClick={() => {
                          handleEditQuestion(
                            exam.question_id,
                            exam.nameQuestion,
                            exam.image
                          );
                          setEditedImageSelected(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger mx-1"
                        onClick={() => {
                          openModalDeleteQuestion();
                          setQuestionID(exam.question_id);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  {editingQuestionId === exam.question_id && (
                    <div className="border-5 p-2">
                      <p className="small fw-bold py-0 my-0">
                        Chỉnh sửa hình ảnh:
                      </p>
                      <input
                        type="text"
                        value={editedImageUrl}
                        onChange={(e) => {
                          setEditedImageUrl(e.target.value);
                          setEditedImageSelected(null);
                        }}
                        placeholder="Enter image URL"
                        style={{
                          width: "50%",
                          height: "50px",
                          border: "1px solid #ced4da",
                          borderRadius: "5px",
                        }}
                        className="mb-2"
                        disabled={editedImageSelected !== null}
                      />{" "}
                      <div className="col-3 mb-3">
                        <label htmlFor="upload" className="form-label fw-bold">
                          Tải ảnh
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="upload"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleImageUploadSelectedEdit}
                          disabled={editedImageUrl.trim() !== ""} // Disable if imageUrl is filled
                        />
                      </div>
                    </div>
                  )}
                  {exam.image && (
                    <>
                      <img
                        src={exam.image}
                        alt="Question"
                        className="img-fluid mb-2"
                        style={{
                          maxWidth: "300px",
                          height: "100%",
                          border: "1px solid #ced4da",
                          borderRadius: "5px",
                        }}
                      />
                    </>
                  )}
                  <ul className="p-0">
                    {newQuestionId === exam.question_id && (
                      <>
                        <input
                          type="text"
                          value={newAnswerText}
                          onChange={(e) => setNewAnswerText(e.target.value)}
                          style={{
                            width: "50%",
                            height: "50px",
                            borderRadius: "5px",
                          }}
                          className="border py-2 my-2"
                          placeholder="Nhập đáp án mới"
                        />
                        <button
                          className="btn btn-primary btn-sm mx-2"
                          onClick={() => handAddAnswer()}
                        >
                          <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm mx-1"
                          onClick={() => setNewQuestionId("")}
                        >
                          <FontAwesomeIcon icon={faClose} />
                        </button>
                      </>
                    )}

                    {exam.answers
                      .filter(
                        (answer) =>
                          answer.isDeletedAnswer === false ||
                          answer.isDeletedAnswer === null
                      )
                      .sort((a, b) => a.createdAt - b.createdAt)
                      .map((answer, ansIndex) => (
                        <li
                          key={answer.answerId}
                          className="mb-2"
                          style={{
                            backgroundColor: answer.correct
                              ? "lightgreen"
                              : "lightcoral",
                            border: "1px solid #ced4da",
                            borderRadius: "5px",
                          }}
                        >
                          {editingAnswerId === answer.answerId ? (
                            <div>
                              <input
                                type="text"
                                value={editedAnswerContent}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value !== null && value !== "") {
                                    setEditedAnswerContent(value);
                                  } else {
                                    alert(
                                      "Nội dung đáp án không được để trống!"
                                    );
                                  }
                                }}
                                style={{
                                  width: "80%",
                                  border: "1px solid #ced4da",
                                  borderRadius: "5px",
                                }}
                              />
                              <div>
                                <input
                                  type="radio"
                                  id={`correctAnswer${index}`}
                                  name={`correctAnswer${exam.question_id}`}
                                  checked={
                                    correctAnswers[answer.answerId] === true
                                  }
                                  onChange={() =>
                                    handleSaveAnswer(
                                      answer.answerId,
                                      exam.question_id,
                                      !correctAnswers[answer.answerId]
                                    )
                                  }
                                />
                                <label htmlFor={`correctAnswer${index}`}>
                                  Chọn câu trả lời đúng
                                </label>
                              </div>
                              <FontAwesomeIcon
                                icon={faSave}
                                className="mx-1"
                                onClick={() =>
                                  handleSaveAnswer(
                                    answer.answerId,
                                    exam.question_id
                                  )
                                }
                              />
                              <FontAwesomeIcon
                                icon={faClose}
                                className="mx-1"
                                onClick={() => {
                                  setEditingAnswerId("");
                                  setEditedAnswerContent("");
                                }}
                              />
                            </div>
                          ) : (
                            <>
                              {String.fromCharCode(97 + ansIndex)}.{" "}
                              {answer.context}
                              <div>
                                <FontAwesomeIcon
                                  icon={faEdit}
                                  className="mx-1"
                                  onClick={() =>
                                    handleEditAnswer(
                                      answer.answerId,
                                      answer.context
                                    )
                                  }
                                />
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="mx-1"
                                  onClick={() => {
                                    if (!answer.correct) {
                                      setAnswerID(answer.answerId);
                                      openModalDeleteAnswer();
                                    } else {
                                      openModalDeleteAnswerTrueAnswer();
                                    }
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* modal new question*/}
      <Modal
        isOpen={modalAddQuestion}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalAddQuestion}
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
            Thêm câu hỏi
          </h2>
          <FontAwesomeIcon icon={faClose} onClick={closeModalAddQuestion} />
        </div>

        <div
          className="container"
          style={{
            width: "750px",
            maxHeight: "500px", // Thiết lập chiều cao tối đa
            overflowY: "auto", // Bật tính năng cuộn dọc
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="questionName" className="form-label fw-bold">
                Tên câu hỏi *
              </label>
              <input
                type="text"
                className="form-control"
                id="questionName"
                value={questionName}
                onChange={(e) => setQuestionName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label fw-bold">
                Đường link ảnh
              </label>
              <input
                type="text"
                className="form-control"
                id="imageUrl"
                value={imageUrl}
                onChange={handleImageUrlChange}
                disabled={selectedImage !== null} // Disable if an image is selected
              />
            </div>
            <div className="col-3 mb-3">
              <label htmlFor="upload" className="form-label fw-bold">
                Tải ảnh
              </label>
              <input
                type="file"
                className="form-control"
                id="upload"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageUpload}
                disabled={imageUrl.trim() !== ""} // Disable if imageUrl is filled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="answerText" className="form-label fw-bold">
                Câu trả lời *
              </label>
              <input
                type="text"
                className="form-control"
                id="answerText"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary mb-3"
              onClick={addAnswer}
            >
              Thêm câu trả lời
            </button>
            <div>
              {answers.map((answer, index) => (
                <div key={index} className="mb-3">
                  <label className="form-label fw-bold">
                    Câu trả lời {index + 1}:
                  </label>
                  <div>
                    <input
                      type="radio"
                      id={`correctAnswer${index}`}
                      name="correctAnswer"
                      checked={correctAnswerIndex === index}
                      onChange={() => setCorrectAnswerIndex(index)}
                    />
                    <label htmlFor={`correctAnswer${index}`}>
                      Chọn câu trả lời đúng
                    </label>
                  </div>
                  <p>{answer}</p>
                </div>
              ))}
            </div>
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              {loading ? "Đang tải..." : "Tạo câu hỏi"}
            </button>
          </form>
        </div>
      </Modal>
      {/* modal delete question */}
      <Modal
        isOpen={modalDeleteQuestion}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalDeleteQuestion}
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
          <FontAwesomeIcon icon={faClose} onClick={closeModalDeleteQuestion} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <p>Bạn có chắc chắc muốn xóa câu hỏi này không?</p>
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
              closeModalDeleteQuestion();
              handleDeleteQuestion();
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
              closeModalDeleteQuestion();
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
      {/* modal delete answer */}
      <Modal
        isOpen={modalDeleteAnswer}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalDeleteAnswer}
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
          <FontAwesomeIcon icon={faClose} onClick={closeModalDeleteAnswer} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <p>Bạn có chắc chắc muốn xóa đáp án này không?</p>
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
              closeModalDeleteAnswer();
              handleDeleteAnswer();
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
              closeModalDeleteAnswer();
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
      {/* modal delete answer true*/}
      <Modal
        isOpen={modalDeleteAnswerTrueAnswer}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModalDeleteAnswerTrueAnswer}
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
            onClick={closeModalDeleteAnswerTrueAnswer}
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
          <p>Bạn không thể xóa đáp án đúng?</p>
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
              closeModalDeleteAnswerTrueAnswer();
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
      <Footer />
    </div>
  );
}
