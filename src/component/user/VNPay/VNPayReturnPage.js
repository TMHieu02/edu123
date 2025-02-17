import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { faHome } from "@fortawesome/free-solid-svg-icons"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VNPayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [vnpParams, setVnpParams] = useState({});
  const [firstValue, setFirstValue] = useState(null);
  const [remainingValues, setRemainingValues] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numberOfCourses, setNumberOfCourses] = useState(0); 
  const [user2Data, setUser2Data] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const searchParams = new URLSearchParams(location.search);
      const vnpData = {};
      for (let [key, value] of searchParams) {
        vnpData[key] = value;
      }
      setVnpParams(vnpData);

      const registerCourses = async () => {
        if (vnpData.vnp_OrderInfo) {
          const orderInfoParts = vnpData.vnp_OrderInfo.split(" ");
          const firstValue = orderInfoParts[0];
          setFirstValue(firstValue);
          const remainingValues = orderInfoParts.slice(1);
          setRemainingValues(remainingValues);
          const encodedUserId = localStorage.getItem("userId");
          const decodedUserId = atob(encodedUserId);

          try {
            const user1 = parseInt(firstValue, 10);
            const userResponse2 = await axiosClient.get(`/users/${user1}`);
            setUser2Data(userResponse2.data);

            setNumberOfCourses(remainingValues.length);

            const transactionsData = [];
            for (let i = 0; i < remainingValues.length; i++) {
              const value = remainingValues[i];
              const courseId = parseInt(value, 10);

              const userId = parseInt(firstValue, 10);

              const response = await axiosClient.get(`/courses/${courseId}`);
              const courseData = response.data;

              const userResponse = await axiosClient.get(`/users/${courseData.userId}`);
              const userData = userResponse.data;

              const transactionData = {
                course: courseData,
                user: userData,
                courseId: courseId,
                userId: userId,
              };

              transactionsData.push(transactionData);

              const response2 = await axiosClient.post("/courseRegisters/vnpay", {
                otp: "000000",
                courseId: courseId,
                userId: userId,
                isActive: true,
              });

              const response1 = await axiosClient.delete(`/carts/${courseId}/${userId}`);
            }

            setTransactions(transactionsData);
            setLoading(false);
          } catch (error) {
            console.error("Error in forEach:", error);
          }
        }
      };

      registerCourses();
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.search]);

  const formatTransactionTime = (timeString) => {
    const year = timeString.slice(0, 4);
    const month = timeString.slice(4, 6);
    const day = timeString.slice(6, 8);
    const hour = timeString.slice(8, 10);
    const minute = timeString.slice(10, 12);
    const second = timeString.slice(12, 14);

    return `${hour}:${minute}:${second} ${day}/${month}/${year} `;
  };

  const navigateToHome = () => {
    navigate("/"); // Navigates to the home page
  };

  return (
    <div className="container">
      <div className="d-flex align-items-center justify-content-between">
        <button className="btn btn-link" onClick={navigateToHome}>
          <FontAwesomeIcon icon={faHome} size="lg" /> Home 
        </button>
        <h1 className="mt-5 text-center text-success">THANH TOÁN THÀNH CÔNG</h1>
        <div></div> {/* Adjust alignment */}
      </div>

      <ul className="list-group mt-3">
        <li className="list-group-item">
          <strong>Tổng tiền thanh toán</strong>{" "}
          {(vnpParams.vnp_Amount / 100).toLocaleString("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}{" "}
          VNĐ
        </li>
        {user2Data.fullname ? (
          <>
            <li className="list-group-item">
              <strong>Người thanh toán:</strong> {user2Data.fullname}
            </li>
            <li className="list-group-item">
              <strong>Thời gian giao dịch:</strong> {formatTransactionTime(vnpParams.vnp_PayDate)}
            </li>
          </>
        ) : (
          <li className="list-group-item">Loading...</li>
        )}
        <li className="list-group-item">
          <strong>Thanh toán ngân hàng:</strong> {vnpParams.vnp_BankCode}
        </li>
        <li className="list-group-item">
          <strong>Mã giao dịch: </strong> {vnpParams.vnp_BankTranNo}
        </li>
        <li className="list-group-item">
          <strong>Số khóa học đã mua: </strong> {numberOfCourses}
        </li>
      </ul>
      {loading ? (
        <p>Loading...</p>
      ) : (
        transactions.map((transaction, index) => (
          <div className="card mt-3" key={index}>
            <div className="row g-0">
              <div className="col-md-3">
                <img
                  src={transaction.course.image}
                  className="img-fluid rounded-start"
                  alt={transaction.course.title}
                />
              </div>
              <div className="col-md-9">
                <div className="card-body">
                  <h5 className="card-title">
                    Khóa học: {transaction.course.title}
                  </h5>
                  <p className="card-text">
                    Giảng viên: {transaction.user.fullname}
                  </p>
                  <p className="card-text">
                    Giá:{" "}
                    {transaction.course.promotional_price.toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VNPayReturn;
