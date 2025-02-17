import { Link } from "react-router-dom";
import React from "react";
import "../../../css/headers.css";

export default function Footer() {
  return (
    <footer className="py-3 my-4 bg-gray p-0 m-0">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Edu123</h5>
            <p>
              Địa chỉ: 1 Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức,
              Thành phố Hồ Chí Minh
            </p>
            <p>Điện thoại: 0708128879</p>
            <p>Email: nhattinh2601@gmail.com, hieultkrm1@gmail.com</p>
            <p>© 2023 EDU123 - Website học trực tuyến hàng đầu hiện nay.</p>
          </div>
          <div className="col-md-4">
            <h5>Liên kết</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <Link to="/user/feedback" className="nav-link p-0 text-muted">
                  Báo cáo cho Admin
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Giới thiệu
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Trợ giúp và hỗ trợ
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Khóa học</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Ngoại ngữ
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Marketing
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Tin học văn phòng
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Thiết kế
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Phát triển cá nhân
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Sale, bán hàng
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Công nghệ thông tin
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Sức khỏe
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link to="#" className="nav-link p-0 text-muted">
                  Phong cách sống
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
