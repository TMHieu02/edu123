import React, { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useNavigate, useParams } from "react-router-dom";

export default function NewQuestion() {
  const [questionName, setQuestionName] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(""); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

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

    try {
      setLoading(true);

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

        // Update imageUrl state with the uploaded image URL
        setImageUrl(uploadResponse.data.data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Đã xảy ra lỗi khi tải ảnh lên");
    } finally {
      setLoading(false);
    }
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
        const imageUrl = uploadResponse.data.data;
      }
      
      // Create the question
      const questionResponse = await axiosClient.post("/questions", {
        question: questionName,
        image: imageUrl,
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

      navigate(`/teacher/course/exam/${id}/question`); 
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Đã xảy ra lỗi khi tạo câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-12 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5 fw-bold">
                  TẠO CÂU HỎI MỚI
                </h2>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="questionName"
                      className="form-label fw-bold"
                    >
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
                      Tải ảnh *
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
                  <button type="submit" className="btn btn-primary">
                    {loading ? "Đang tải..." : "Tạo câu hỏi"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
