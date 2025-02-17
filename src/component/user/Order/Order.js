import "./Order.css";
import { useNavigate, Link } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosClient from "../../../api/axiosClient";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  const inforArray = location.state.inforArray;
  const totalPayment  = location.state.totalPayment;  

  const { courseId, cartId, otp } = useParams();
  const [price, setPrice] = useState(0);
  const formatPrice = (price) => {
    if (typeof price !== "string") {
      price = String(price);
    }
    if (price == "0") {
      return "0 đồng";
    }
  
    if (price.startsWith("0")) {
      price = price.slice(1);
    }
  
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const handleDelete = async (itemId) => {
    try {
      await axiosClient.delete(`/carts/${itemId}`);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axiosClient.get(`courses/${courseId}`);
        const userData = response.data.promotional_price;
        setPrice(formatPrice(userData));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  const [isShowThankYou, setIsShowThankYou] = useState(false);

  const handlePayment = async () => {
    const encodedUserId = localStorage.getItem("userId");
    const userId = parseInt(atob(encodedUserId), 10);

   
      try {
        let checkSuccess = false;
        await Promise.all(inforArray.map(async (item) => {
          const { cart_id, course_id, otp } = item; // Lấy ra các thuộc tính từ mỗi phần tử của mảng
          try {
            const response = await axiosClient.post(`/courseRegisters/register-course/${userId}/${course_id}/${otp}`);
            console.log('response register: ', response.status);
            if (response.status === 200) {
              checkSuccess = true;
            }
            handleDelete(cart_id);
          } catch (error) {
            console.error("Error:", error);
          }
        }));
        if (checkSuccess) {
          setIsShowThankYou(true);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
      }    
  };
  
  //modal login add to card
  const [showAlertModal, setShowAlertModal] = useState(false);
  const handleShowAlertModal = () => setShowAlertModal(true);
  const handleCloseAlertModal = () => setShowAlertModal(false);

  return (
    <div className="container">
    <Header />
    {isShowThankYou ? (
      <>
      <div className="container">
      <div className="py-5 text-center">
        <p className="font-bold text-2xl">Cảm ơn bạn đã đặt hàng</p>
        <p className="lead">
          Thông tin đã được gửi cho quản trị viên, trong thời gian tới vui lòng kiểm tra email cập nhật thông tin.
        </p>
      </div>

      <div className="row">
        <div className="col-lg-6 offset-lg-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Cần Hỗ Trợ?</h5>
              <p className="card-text">
                Nếu bạn muốn hỗ trợ thì vui lòng gọi tới số điện thoại: <a href="tel:0708128879">0708128879</a> hoặc email <a href="mailto:20110576@student.hcmute.edu.vn">20110576@student.hcmute.edu.vn</a> để được hỗ trợ!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
      </>
    ): (
      <>
          <section className="h-100 gradient-custom">
      <div className="row justify-content-center">
        <div className="col-lg-9 py-5">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="icon-size"
              color="blue"
            />
            <h4 className="fw-bold p-4">Đặt hàng thành công!</h4>
            <p>Vui lòng chuyển khoản vào tài khoản sau đây!</p>
            <p>Tên tài khoản: <span className="fw-bold">Công ty cổ phần đạo tạo trực tuyến EDU123</span></p>           
            <p>Nội dung: <span className="fw-bold">{otp}</span></p>
            <p>Số tiền: <span className="fw-bold text-lg">{formatPrice(totalPayment)}</span> vnđ</p>
            <br />
            <br />
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Số tài khoản</th>
                  <th>Ngân hàng</th>
                  <th>Mã QR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>58110001417006</td>
                  <td>BIDV</td>
                  <td>QR...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <div className="d-flex justify-content-center">
          <button type="button" className="btn btn-info" onClick={()=> handleShowAlertModal()}>
            Tôi đã chuyển khoản
          </button>
        </div>
        <div className="d-flex justify-content-center">
          <button onClick={() => navigate("/")} className="btn btn-primary mt-3">
            Xem thêm các khóa học
          </button>
        </div>
      </div>
    </div>
      </>
    )}
     {/* alert modal */}
     <div
        className="modal"
        tabIndex="-1"
        style={{ display: showAlertModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontWeight: "bold" }}>
                Thông báo
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAlertModal}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className="">Bạn có chắc chắn muốn chuyển khoản?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  handleCloseAlertModal();
                  handlePayment();
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    <Footer />
  </div>
  
  );
}