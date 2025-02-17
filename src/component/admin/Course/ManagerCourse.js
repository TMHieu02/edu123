import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faSort } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "./manager-course.css";
import Pagination from "../../Others/Pagination";
export default function ManagerCourse() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    window.open(path, "_blank");
  };


  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  const [selectedRole, setSelectedRole] = useState("true");
  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    console.log(newRole);
    setSelectedRole(newRole);
    await classify(newRole); // Gọi hàm classify với giá trị role mới
  };

  const classify = async (role) => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get(
        `/courses/getCoursesAndRelateInfo`
      );
      // let users = response.data;
      let users = courses;
      // Sắp xếp và lọc dữ liệu như bạn muốn
      users = response.data.sort((a, b) => {
        // So sánh thời gian tạo giữa hai người dùng và sắp xếp từ mới đến cũ
        return new Date(b.updateAt) - new Date(a.updateAt);
      });
      // Lọc dữ liệu dựa trên giá trị của role
      users = users.filter((user) => {
        if (role === "true") {
          console.log("true nè");
          return user.active === true;
        } else if (role === "false") {
          console.log("false nè");
          return user.active === false;
        }
        return true;
      });

      setCourses(users);
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const [sortOrder, setSortOrder] = useState('desc'); // Giữ trạng thái sắp xếp
  const sortSold = async () => {
    const sortedCourses = [...courses].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.sold - b.sold; // Sắp xếp từ thấp đến cao
      } else {
        return b.sold - a.sold; // Sắp xếp từ cao xuống thấp
      }
    });
    setCourses(sortedCourses);
    // Đảo ngược trạng thái sắp xếp sau mỗi lần click
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get(
        `/courses/getCoursesAndRelateInfo`
      );
      const filteredCourses = response.data.filter(
        (user) =>
          user.title.toLowerCase().includes(search.toLowerCase()) ||
          user.user_name.toLowerCase().includes(search.toLowerCase())
      );
      setCourses(filteredCourses);
      if (filteredCourses.length > 0) {
      } else {
        setNotification({
          type: "success",
          message:
            "Không tìm thấy khóa học với tên hay giảng viên là: " + search,
        });
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleToggleLock = async (course_id, active) => {
    try {
      console.log(active);
      if (active) {
        console.log(course_id);
        setIsLoading(true);
        const response = await axiosClient.patch(
          `/courses/lock-course/${course_id}`
        );
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
          setNotification({
            type: "success",
            message: "Khóa khóa học thành công!",
          });
        }, 1000);
        console.log(response);
      } else {
        console.log(course_id);
        setIsLoading(true);
        const response = await axiosClient.patch(
          `/courses/unlock-course/${course_id}`
        );
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
          setNotification({
            type: "success",
            message: "Mở khóa khóa học thành công!",
          });
        }, 1000);
        console.log(response);
      }
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      handleSearch();
    } catch (error) {
      console.error("Error to lock or unlock course:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi, vui lòng thử lại",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  //paging
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(
          `/courses/getCoursesAndRelateInfo`
        );
        let sortedUsers = response.data.sort((a, b) => {
          // So sánh thời gian tạo giữa hai người dùng và sắp xếp từ mới đến cũ
          return new Date(b.updateAt) - new Date(a.updateAt);
        });

        // Lọc dữ liệu dựa trên giá trị của role
        sortedUsers = sortedUsers.filter((user) => {
          if (selectedRole === "true") {
            console.log("true nè");
            return user.active === true;
          } else if (selectedRole === "false") {
            console.log("false nè");
            return user.active === false;
          }
          return true;
        });
        // Nếu có yêu cầu tìm kiếm, lọc người dùng theo từ khóa tìm kiếm
        if (search) {
          sortedUsers = sortedUsers.filter((user) =>
            user.createAt.toLowerCase().includes(search.toLowerCase())
          );
        }

        setCourses(sortedUsers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  //paging

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        {/* Search bar */}
        <div className="row mb-4">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm người dùng hoặc giảng viên"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-inline-block">Danh sách khóa học</h5>
          </div>
          <div className="d-d-inline-block">
            <select
              className="custom-select"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="true">Đang hoạt động</option>
              <option value="false">Bị khóa</option>
            </select>
          </div>
          {notification && (
            <div className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          )}

          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Tên khóa học</th>
                  <th scope="col">Danh mục</th>
                  <th scope="col">Tên giảng viên</th>
                  <th scope="col">Giá 
     </th>
                  <th scope="col">Giá khuyến mãi</th>
                  <th scope="col">Số lượng bán  <button onClick={() =>
                          sortSold()
                        }>
      <FontAwesomeIcon icon={faSort} />
      </button></th>
                  <th scope="col">Ngày cập nhật</th>
                  <th scope="col">Trạng thái</th>
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
                {courses.slice(startIndex, endIndex).map((course, index) => (
                  <tr key={course.course_id}>
                    <th scope="row">{index + 1}</th>
                    <td>{course.title}</td>
                    <td>{course.category_name}</td>
                    <td>{course.user_name}</td>
                    <td>{course.price}</td>
                    <td>{course.promotional_price}</td>
                    <td>{course.sold}</td>
                    <td>{new Date(course.updateAt).toLocaleString("vi-VN")}</td>
                    <td>
                      {course.active === true ? "Đang hoạt động" : "Bị khóa"}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          handleNavigate(
                            `/admin/public-course/course-info/${course.course_id}`
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                      </button>
                      &nbsp;
                      <button
                        className={`btn btn-sm ${
                          course.active === true ? "btn-danger" : "btn-success"
                        }`}
                        onClick={() =>
                          handleToggleLock(course.course_id, course.active)
                        }
                      >
                        {course.active === true ? "Khóa" : "Mở khóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              pageCount={Math.ceil(courses.length / itemsPerPage)}
              handlePageClick={handlePageClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
