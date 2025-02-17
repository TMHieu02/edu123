import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,  
  faList,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function PublicCoursePanel() {
  return (
    <div className="card-body">
      <h3 className="card-title">Panel</h3>
      <ul className="list-group">
        <li className="list-group-item">
          <FontAwesomeIcon
            icon={faBook}
            style={{ color: "#999", fontSize: "20px", marginRight: "10px" }}
          />
          <Link
            to="/admin/public-course/course-info"
            className="fw-bold text-decoration-none"
          >
            Thông tin khóa học
          </Link>
        </li>
        <li className="list-group-item">
          <FontAwesomeIcon
            icon={faList}
            style={{ color: "#999", fontSize: "20px", marginRight: "10px" }}
          />
          <Link
            to="/admin/public-course/lession"
            className="fw-bold text-decoration-none"
          >
            Danh sách bài học
          </Link>
        </li>
        <li className="list-group-item">
          <FontAwesomeIcon
            icon={faFile}
            style={{ color: "#999", fontSize: "20px", marginRight: "10px" }}
          />
          <Link
            to="/admin/public-course/document"
            className="fw-bold text-decoration-none"
          >
            Tài liệu
          </Link>
        </li>
        <li className="list-group-item">          
          <Link
            to="/admin/public-course/summary"
            className="fw-bold text-decoration-none"
          >
            Kết luận
          </Link>
        </li>
      </ul>
    </div>
  );
}
