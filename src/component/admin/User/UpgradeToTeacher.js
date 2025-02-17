import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "./upgrade-to-teacher.css";
import Pagination from "../../Others/Pagination";


export default function UpgradeToTeacher() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    window.open(path, "_blank");
   };

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  //paging
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  //paging

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(`/users/role=4`);
        let sortedUsers = response.data.sort((a, b) => {
          // So sánh thời gian tạo giữa hai người dùng và sắp xếp từ mới đến cũ
          return new Date(b.updateAt) - new Date(a.updateAt);
        });
        setIsLoading(false);
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);


  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        <div className="card mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-inline-block">
              Danh sách yêu cầu người dùng
            </h5>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Họ và tên</th>
                  <th scope="col">Email</th>
                  <th scope="col">Ngày yêu cầu</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              {isLoading ? (
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div></div>
              )}
              <tbody>
                {users.slice(startIndex, endIndex).map((user, index) => (
                  <tr key={user.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.fullname}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.updateAt).toLocaleString("vi-VN")}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm  d-inline-block "
                        onClick={() =>
                          handleNavigate(
                            `/admin/upgrade-to-teacher/detail/${user.Id}`
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
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
