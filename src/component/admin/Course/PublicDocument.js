
import PublicCoursePanel from "./PublicCoursePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link } from "react-router-dom";

import { faPlay, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";



export default function PublicDocument() {
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
          <div className="container">
                  {/* List of documents */}
                  <div className="card mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 d-inline-block">Tài liệu đã tải lên</h5>                                            
                    </div>

                    <div className="card-body">
                      <div className="row">
                        <div className="col-lg-3 col-md-12 mb-4 mb-lg-0">
                          <div
                            className="bg-image hover-overlay hover-zoom ripple rounded"
                            data-mdb-ripple-color="light"
                          >
                            {/* Replace with actual document thumbnail */}
                            <img
                              src="https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/Vertical/12a.webp"
                              className="image-course"
                              alt="Document Thumbnail"
                            />
                          </div>
                        </div>

                        <div className="col-lg-5 col-md-6 mb-4 mb-lg-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <p><strong>Tiêu đề tài liệu</strong></p>
                              <p>Giảng viên: Tên giảng viên</p>
                            </div>

                            <div className="float-end">
                              <button
                                className="btn btn-primary btn-sm margin-button-header"
                                onClick={() => handleNavigate("/teacher/course/edit-document-detail")}
                              >
                                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                              </button>
                              
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
                          {/* Additional space if needed */}
                        </div>
                      </div>
                      {/* Additional documents */}
                    </div>
                  </div>
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