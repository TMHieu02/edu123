
import PublicCoursePanel from "./PublicCoursePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link } from "react-router-dom";

import { faPlay, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";



export default function PublicLession() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const lessons = [
    {
      id: 1,
      title: "Bài 1: Giới thiệu và các thiết lập cơ bản",
      duration: "08:05",
    },
    {
      id: 2,
      title: "Bài 2: Tạo mới, mở và lưu trữ file văn bản",
      duration: "06:58",
    },
    {
      id: 3,
      title: "Bài 3: Hướng dẫn tập gõ nhanh văn bản bằng 10 ngón",
      duration: "06:58",
    },
    { id: 4, title: "Bài 4: Sao chép, cắt, dán văn bản", duration: "06:58" },
    // Add more lessons as needed
  ];

  return (
    <div>
      
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-7 mx-auto">
            <div className="bg-white" id="noidung">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Nội dung khóa học</h3>                
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tiêu đề</th>
                    <th>Thời lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>
                        <FontAwesomeIcon icon={faPlay} />
                      </td>
                      <td>{lesson.title}</td>
                      <td>{lesson.duration}</td>
                      <td>
                        <button
                          className="btn btn-primary margin-button-header"
                          onClick={() => handleNavigate("/admin/public-course/lession/detail")}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            <div className="bg-white" id="panel">
              <PublicCoursePanel/> {/* panel component */}
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );
}