import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faList, faFile, faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function EditCoursePanel({ courseId }) {
  return (
    <div className="card-body">      
      <ul className="list-group list-group-numbered">
        <li className="list-group-item active">
          <FontAwesomeIcon icon={faCheckSquare} color='blue' size="lg" />&nbsp;
          <Link to={`/teacher/course/edit-course/${courseId}`} className="fw-bold text-decoration-none  text-dark">
            Thông tin cơ bản
          </Link>
        </li>
        <li className="list-group-item">
          <FontAwesomeIcon icon={faCheckSquare} color='blue' size="lg" />&nbsp;
          <Link to={`/teacher/course/edit-course/${courseId}`} className="fw-bold text-decoration-none  text-dark">
            Tóm tắt nội dung của khóa học
          </Link>
        </li>
        <li className="list-group-item">
        <FontAwesomeIcon icon={faSquare} color='white' size="lg" />&nbsp;
          <Link to={`/teacher/course/edit-lession/${courseId}`} className="fw-bold text-decoration-none text-dark">
            Danh sách bài học
          </Link>
        </li>
        <li className="list-group-item">
          <FontAwesomeIcon icon={faSquare} color='white' size="lg" />&nbsp;
          <Link to={`/teacher/course/edit-course/${courseId}`} className="fw-bold text-decoration-none text-dark">
            Bài kiểm tra
          </Link>
        </li>
        <li className="list-group-item">
        <FontAwesomeIcon icon={faSquare} color='white' size="lg" />&nbsp;
          <Link to={`/teacher/course/edit-document/${courseId}`} className="fw-bold text-decoration-none text-dark">
            Tài liệu
          </Link>
        </li>
      </ul>
    </div>
  );
}
