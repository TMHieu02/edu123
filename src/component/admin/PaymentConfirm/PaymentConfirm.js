import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, // icon for "Reject"
  faPaperPlane, // icon for "Send Activation Code"
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";

import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "../Course/manager-course.css";
import Pagination from "../../Others/Pagination";

export default function PaymentConfirm() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  //paging
  //paging
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const response = await axiosClient.get(
        `/courseRegisters/getcoursenoactive`
      );
      const filteredUsers = response.data.filter(
        (user) => user.isActive === null || user.isActive === false
      );
      let sortedUsers = filteredUsers.sort((a, b) => {
        return new Date(b.createAt) - new Date(a.createAt);
      });

      setUsers(sortedUsers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleActiveCourse = async (register_course_id, email, course_name) => {
    try {
      console.log(register_course_id);
      setIsLoading(true);
  
      // Concurrently execute the two API calls
      const [messageResponse, messageResponseEmail] = await Promise.all([
        axiosClient.put(`/courseRegisters/active-course/${register_course_id}`),
        axiosClient.post(`/auth/send/message/title/${email}`, {
          message: `Congratulations! You have successfully registered for the course "${course_name}"! Start uploading your course and earning money now!`,
          title: `EDU123 - CONGRATULATIONS! YOU HAVE SUCCESSFULLY REGISTERED FOR THE COURSE "${course_name}"`
        })
      ]);
  
      console.log(messageResponse);
      console.log(messageResponseEmail);
  
      setIsLoading(false);
      setNotification({
        type: "success",
        message: "Kích hoạt khóa học thành công!",
      });
  
      fetchUsers();
  
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error updating role or sending message:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi vui lòng thử lại sau!",
      });
  
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };
  

  const reject = async (register_course_id) => {
    try {
      console.log(register_course_id);
      setIsLoading(true);
      const messageResponse = await axiosClient.put(
        `/courseRegisters/reject-confirm-payment/${register_course_id}`
      );
      console.log(messageResponse);
      setIsLoading(false);
      setNotification({
        type: "success",
        message: "Từ chối khóa học thành công!",
      });
      fetchUsers();
      setTimeout(() => {
        setNotification(null);
       }, 5000);
    } catch (error) {
      console.error("Error updating role or sending message:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi vui lòng thử lại sau!",
      });
      setTimeout(() => {
        setNotification(null);
       }, 5000);
    }
  };

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-9">
        {/* List of documents */}
        <div className="card mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-inline-block">
              Danh sách xác nhận thanh toán
            </h5>
            {notification && (
              <div className={`notification ${notification.type}`}>
                {notification.message}
              </div>
            )}
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Họ và tên</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Date </th>
                  <th scope="col">OTP</th>
                  <th scope="col">Khóa học</th>
                  <th scope="col">Giá tiền</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {users.slice(startIndex, endIndex).map((user, index) => (
                  <tr key={index}>
                    <td className="">
                      {user.fullname}
                    </td>
                    <td className="">
                      {user.phone}
                    </td>
                    <td className="">                      
                        {new Date(user.updateAt).toLocaleString("vi-VN")}                      
                    </td>
                    <td className="">
                      {user.otp}
                    </td>
                    <td className="">
                     {user.course_name}
                    </td>
                    <td className="text-primary">
                      {user.price}
                    </td>
                    <td >
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() =>
                          handleActiveCourse(user.register_course_id, user.email, user.course_name)
                        }
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Kích hoạt
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => reject(user.register_course_id)}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              pageCount={Math.ceil(users.length / itemsPerPage)}
              handlePageClick={handlePageClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
