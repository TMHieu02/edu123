import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./NewCourse.css";

import { useNavigate } from "react-router-dom";

export default function NewCourseProcess() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };
  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-9 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h4 className="text-center fw-bold ">
                  Tiêu chuẩn chất lượng khóa học{" "}
                </h4>
                <ol className="styled">
                  <li>
                    Mỗi khóa học phải giải quyết vấn đề của một nhóm khách hàng
                    cụ thể
                  </li>
                  <li>
                    Giảng viên cần có nhiều năm kinh nghiệm trong lĩnh vực mà
                    mình chia sẻ
                  </li>
                  <li>
                    Tập trung vào những kinh nghiệm và trải nghiệm của bản thân
                  </li>
                  <li>
                    Khóa học cần có tối thiểu 3 phần, mỗi phần cần có nhiều bài
                    học
                  </li>
                  <li>
                    Mỗi bài học có thể là video hoặc văn bản (không quá 20% tổng
                    số bài)
                  </li>
                  <li>Một bài học tập trung 1 kĩ năng, có tên gọi riêng</li>
                </ol>
              </div>
              <div className="card-body p-4 p-sm-5">
                <h4 className="text-center fw-bold ">
                  Tiêu chuẩn chất lượng video{" "}
                </h4>
                <ol className="styled">
                  <li>Mỗi bài học có thời lượng tối thiểu 5-7 phút</li>
                  <li>
                    Chất lượng video{" "}
                    <span className="fw-bold">
                      HD1080p hoặc 720, khung hình 16:9
                    </span>{" "}
                  </li>
                  <li>
                    Chất lượng audio: nghe rõ, không lẫn tạp âm hay tiếng ồn
                    xung quanh{" "}
                  </li>
                  <li>
                    Kích cơ file video:{" "}
                    <span className="fw-bold">1GB và định dạng là .mp4</span>
                  </li>
                  <li>
                    Không chứa quảng cáo: logo, tên miền, địa chỉ, số điện thoại
                  </li>
                </ol>
              </div>
              <div className="card-body p-4 p-sm-5">
                <h4 className="text-center fw-bold ">
                  Gợi ý cấu trúc 1 bài học, 1 bài bán hàng{" "}
                </h4>
                <ol>
                  <li>
                    <span className="fw-bold">
                      Cấu trúc nội dung khi trình bày một chủ đề
                    </span>
                    <ul className=" custom-list">
                      <li>
                        <span className="fw-bold">WHAT</span> - Cái gì
                      </li>
                      <li>
                        <span className="fw-bold">WHY</span> - Tại sao lại quan
                        trọng
                      </li>
                      <li>
                        <span className="fw-bold">HOW</span> - Như thế nào, cách
                        nào?
                      </li>
                      <li>
                        <span className="fw-bold">DEMO</span> - Làm mẫu
                      </li>
                      <li>
                        <span className="fw-bold">
                          Dặn dò + "hẹn gặp bạn trong video tiếp theo"
                        </span>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="fw-bold">
                      Cấu trúc 1 video Sale(gợi ý): 2-5 phút
                    </span>
                    <ul className=" custom-list">
                      <li>
                        <span className="fw-bold">Vấn đề</span> học viên hay gặp
                        phải
                      </li>
                      <li>
                        <span className="fw-bold">Giải pháp</span>: tên + lợi
                        ích quan trọng nhất của khóa học
                      </li>
                      <li>
                        <span className="fw-bold">Lợi ích</span>: được gì, biết
                        làm cách gì (3, 5, 7 lợi ích)
                      </li>
                      <li>
                        <span className="fw-bold">Kêu gọi hành động</span> - Làm
                        mẫu
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="fw-bold">
                      VIDEO SALE cần trả lời được câu hỏi
                    </span>
                    <ul className=" custom-list">
                      <li>Tạo sao bạn nên học khóa học này?</li>
                      <li>Tại sao bạn nên học từ tôi?</li>
                    </ul>
                  </li>
                </ol>
                <div className=" justify-content-center d-flex">                  
                  <button
                    className="btn btn-danger"
                    onClick={() => handleNavigate("/teacher/course/new-course")}
                  >
                    Tạo khóa học ngay!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}