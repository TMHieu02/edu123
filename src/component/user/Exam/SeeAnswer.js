import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import { useNavigate, useParams } from "react-router-dom";


export default function SeeAnswer() {
  const { id } = useParams();
  const [examData, setExamData] = useState([]);
  const [notification, setNotification] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestionContent, setEditedQuestionContent] = useState({});
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswerContent, setEditedAnswerContent] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [newAnswerContent, setNewAnswerContent] = useState(""); // State for new answer content
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        const response3 = await axiosClient.get(`/exams/${id}`);
        const courseId = response3.data.courseId;
        // nếu có roleId bằng 3 tức là admin thì được vào
        const roleIdLocal = localStorage.getItem("roleId");
        const roleId = parseInt(atob(roleIdLocal), 10);
        console.log("role id: ", roleId); 
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response = await axiosClient.get(
            `/courseRegisters/check/${userId}/${courseId}`
          );
          const response1 = await axiosClient.get(
            `/courses/check/${courseId}/${userId}`
          );

          if (response.data === true || response1.data === true) {
          } else if (roleId === 3){

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

  const fetchData = async () => {
    try {
      const examData = await axiosClient.get(`/questions/exam=${id}`);
      setExamData(examData.data);

      const correctAnswersData = {};
      examData.data.forEach((question) => {
        question.answers.forEach((answer) => {
          correctAnswersData[answer.answerId] = answer.correct || false;
        });
      });
      setCorrectAnswers(correctAnswersData);
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-9">
            <div className="bg-white p-4" id="noidung">
              <h3 className="mb-4">Danh sách các câu hỏi và đáp án</h3>

              {notification && (
                <div className={`alert alert-${notification.type}`}>
                  {notification.message}
                </div>
              )}
              {examData.map((exam, index) => (
                <div key={exam.question_id} className="border-bottom pb-4">
                  <h4 className="">
                    <span>Câu hỏi {index + 1}</span>
                    {editingQuestionId === exam.question_id ? (
                      <div></div>
                    ) : (
                      <div></div>
                    )}
                  </h4>
                  <div className="question mb-3 border p-3">
                    <p>
                      {editingQuestionId === exam.question_id ? (
                        <input
                          type="text"
                          value={editedQuestionContent}
                          onChange={(e) =>
                            setEditedQuestionContent(e.target.value)
                          }
                          style={{
                            width: "100%",
                            height: "50px",
                            border: "1px solid #ced4da",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        exam.nameQuestion
                      )}
                    </p>
                    {editingQuestionId === exam.question_id && (
                      <input
                        type="text"
                        value={editedImageUrl}
                        onChange={(e) => setEditedImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                        style={{
                          width: "100%",
                          height: "50px",
                          border: "1px solid #ced4da",
                          borderRadius: "5px",
                        }}
                      />
                    )}
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
                                <div></div>
                              </div>
                            ) : (
                              <>
                                {String.fromCharCode(97 + ansIndex)}.{" "}
                                {answer.context}
                                {editingQuestionId === exam.question_id && (
                                  <div></div>
                                )}
                              </>
                            )}
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
      <Footer />
    </div>
  );
}
