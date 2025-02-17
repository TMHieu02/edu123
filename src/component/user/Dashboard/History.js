import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import { Link } from "react-router-dom";

import background from "../../../assets/images/background_dashboard.jpg";

export default function History() {
  return (
    <div>
      <Header />
      <div className="container">
        <div class="container-fluid pt-5 overlay">
          <img
            class="img-background"
            width="1555px"
            height="220px"
            style={{ marginTop: "80px" }}
            src={background}
            alt="Đỗ Trung Thành"
            loading="lazy"
          />
          <div class="row"></div>
          <br />
          <br />
          <br />

          <div class="d-inline-block text-black d-flex justify-content-center">
            <ul class="nav nav-tabs text-white mx-auto">
              <li class="nav-item">
                <Link
                  to="/user/dashboard"
                  class="nav-link "
                  aria-current="page"
                >
                  Khóa học của tôi
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link active" href="#">
                  Lịch sử thanh toán
                </Link>
              </li>
            </ul>
          </div>
          <br />
          <br />
          <br />
          {/* nội dung */}
          <div class="card mb-4">
            <div class="card-header py-3">
              <h5 class="mb-0 d-inline-block">Danh sách đơn hàng</h5>
            </div>

            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th scope="col">Mã đơn hàng</th>
                        <th scope="col">Khóa học</th>
                        <th scope="col">Mã kích hoạt</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col">Ngày kích hoạt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.orderId}</td>
                  <td>{order.course}</td>
                  <td>{order.activationCode}</td>
                  <td>{order.status}</td>
                  <td>{order.activationDate}</td>
                </tr>
              ))} */}
                    </tbody>
                  </table>
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
