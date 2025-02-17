import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faClose } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "../Course/manager-course.css";
import Pagination from "../../Others/Pagination";
import Modal from "react-modal";

export default function CourseActive() {
 const navigate = useNavigate();

 const handleNavigate = (path) => {
  window.open(path, "_blank");
 };

 const [courses, setCourses] = useState([]);
 const [notification, setNotification] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 const [courseID, setCourseID] = useState('');


 const [userID, setuserID] = useState('');
 const [contentRefuse, setContenRefuse] = useState('');
 const refuse = async () => {
  try {
   setIsLoading(true);
   console.log('course id: ', courseID);
   const response = await axiosClient.patch(`/courses/${courseID}`, {
    Active: false,
   });
   if (response.status === 200) {
    setNotification({
     type: "success",
     message: "Bạn đã khóa khóa học thành công!",
    });
    fetchData();
    const responseUser = await axiosClient.get(`/users/${userID}`);
    if (responseUser.status === 200) {
     const email = responseUser.data.email;
     // const email = "responseUser.data@email";
     console.log('email: ', email);
     const trimInput = (value) => {
      // Bảng ánh xạ các ký tự có dấu thành không dấu
      const diacriticsMap = {
       'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ì': 'I', 'Í': 'I', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O',
       'Ù': 'U', 'Ú': 'U', 'Ý': 'Y', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'è': 'e', 'é': 'e', 'ê': 'e', 'ì': 'i', 'í': 'i', 'ò': 'o',
       'ó': 'o', 'ô': 'o', 'õ': 'o', 'ù': 'u', 'ú': 'u', 'ý': 'y', 'Ă': 'A', 'ă': 'a', 'Đ': 'D', 'đ': 'd', 'Ĩ': 'I', 'ĩ': 'i', 'Ũ': 'U',
       'ũ': 'u', 'Ơ': 'O', 'ơ': 'o', 'Ư': 'U', 'ư': 'u', 'Ạ': 'A', 'ạ': 'a', 'Ả': 'A', 'ả': 'a', 'Ấ': 'A', 'ấ': 'a', 'Ầ': 'A', 'ầ': 'a',
       'Ẩ': 'A', 'ẩ': 'a', 'Ẫ': 'A', 'ẫ': 'a', 'Ậ': 'A', 'ậ': 'a', 'Ắ': 'A', 'ắ': 'a', 'Ằ': 'A', 'ằ': 'a', 'Ẳ': 'A', 'ẳ': 'a', 'Ẵ': 'A',
       'ẵ': 'a', 'Ặ': 'A', 'ặ': 'a', 'Ẹ': 'E', 'ẹ': 'e', 'Ẻ': 'E', 'ẻ': 'e', 'Ẽ': 'E', 'ẽ': 'e', 'Ế': 'E', 'ế': 'e', 'Ề': 'E', 'ề': 'e',
       'Ể': 'E', 'ể': 'e', 'Ễ': 'E', 'ễ': 'e', 'Ệ': 'E', 'ệ': 'e', 'Ỉ': 'I', 'ỉ': 'i', 'Ị': 'I', 'ị': 'i', 'Ọ': 'O', 'ọ': 'o', 'Ỏ': 'O',
       'ỏ': 'o', 'Ố': 'O', 'ố': 'o', 'Ồ': 'O', 'ồ': 'o', 'Ổ': 'O', 'ổ': 'o', 'Ỗ': 'O', 'ỗ': 'o', 'Ộ': 'O', 'ộ': 'o', 'Ớ': 'O', 'ớ': 'o',
       'Ờ': 'O', 'ờ': 'o', 'Ở': 'O', 'ở': 'o', 'Ỡ': 'O', 'ỡ': 'o', 'Ợ': 'O', 'ợ': 'o', 'Ụ': 'U', 'ụ': 'u', 'Ủ': 'U', 'ủ': 'u', 'Ứ': 'U',
       'ứ': 'u', 'Ừ': 'U', 'ừ': 'u', 'Ử': 'U', 'ử': 'u', 'Ữ': 'U', 'ữ': 'u', 'Ự': 'U', 'ự': 'u', 'Ỳ': 'Y', 'ỳ': 'y', 'Ỵ': 'Y', 'ỵ': 'y',
       'Ỷ': 'Y', 'ỷ': 'y', 'Ỹ': 'Y', 'ỹ': 'y'
      };

      // Hàm chuyển đổi ký tự có dấu thành không dấu
      const removeDiacritics = (str) => {
       return str.split('').map(char => diacriticsMap[char] || char).join('');
      };

      // Loại bỏ khoảng trắng thừa và chuyển đổi ký tự
      return removeDiacritics(value.trim());
     };
     try {
      await axiosClient.post(
       `/auth/send/message/title/${email}`,
       {
        message: trimInput(contentRefuse),
        title: "EDU123 - YOUR COURSE HAS BEEN LOCKED"
       }
      );
     } catch (error) {

     }

    }
    setTimeout(() => {
     setNotification(null);
    }, 5000);
   }
   setIsLoading(false);
  } catch (error) {
   console.error("Error fetching data:", error);
   setNotification({ type: "error", message: "Error!" });
   setTimeout(() => {
    setNotification(null);
   }, 5000);
   setIsLoading(false);
  }
 }

 // Paging
 const [currentPage, setCurrentPage] = useState(0);
 const handlePageClick = ({ selected }) => {
  setCurrentPage(selected);
 };

 const itemsPerPage = 5;
 const startIndex = currentPage * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 const fetchData = async () => {
  try {
   setIsLoading(true);
   const response = await axiosClient.get(`/courses/course-active`);
   const filteredCourses = response.data
    .sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt));
   setCourses(filteredCourses);
   setIsLoading(false);
  } catch (error) {
   console.error("Error fetching data:", error);
  }
 };
 useEffect(() => {
  fetchData();
 }, []);

 let subtitle;
 const customStyles = {
  content: {
   top: "50%",
   left: "50%",
   right: "auto",
   bottom: "auto",
   marginRight: "-50%",
   transform: "translate(-50%, -50%)",
  },
 };
 function afterOpenModal() {
  subtitle.style.color = "#f00";
 }

 const [modalDelete, setIsModalDelete] = useState(false);

 function openModalDelete() {
  setIsModalDelete(true);
 }
 function closeModalDelete() {
  setIsModalDelete(false);
 }

 const [coursesSearch, setCoursesSearch] = useState([]);
 const [search, setSearch] = useState("");
 const handleSearchChange = (e) => {
  setSearch(e.target.value);
  const inputValue = e.target.value; // Lấy giá trị từ sự kiện onChange
  if (
   inputValue === null ||
   inputValue === undefined ||
   inputValue.trim() === ""
  ) {
   setIsShowResult(false);
  }
 };
 const handleSearch = async () => {
  try {
   setIsLoading(true);
   if (search !== null && search !== undefined && search.trim() !== "") {
    const filteredUsers = courses.filter((user) => {
     const accountName = user?.title?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng     
     return (
      accountName.includes(search.toLowerCase()) 
     );
    });
    setIsLoading(false);
    setCoursesSearch(filteredUsers);
    setIsShowResult(true);
    setCurrentPage(0);          
    if (filteredUsers.length === 0) {
     setNotification({
      type: "success",
      message:
       "Không tìm thấy người dùng với tên hoặc số tài khoản: " +
       search,
     });
     setTimeout(() => {
      setNotification(null);
     }, 3000);
    } else {
     console.log("teacher result: ", filteredUsers);
     setNotification(null);
    }
   } else {
    setIsShowResult(false);
    setIsLoading(false);
    console.log("Error fetching users: Search is null or undefined");
   }

  } catch (error) {
   setIsLoading(false);
   console.error("Error fetching users:", error);
  }
 };
 const [isShowResult, setIsShowResult] = useState(false);

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
       placeholder="Search..."
      value={search}
      onChange={handleSearchChange}
      />
     </div>
     <div className="col-auto">
      <button
       className="btn btn-primary"
       onClick={() => {
        handleSearch();
       }}
      >
       Search
      </button>
     </div>
    </div>
    <div className="card mb-4">

     <div className="card-header py-3 d-flex justify-content-between align-items-center">
      <h5 className="mb-0 d-inline-block">Danh sách các khóa học đang hoạt động</h5>

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
         <th scope="col">Ngày cập nhật</th>
         <th scope="col">Hành động</th>
        </tr>
       </thead>
       {isLoading ? (
        <div className="spinner-border text-primary" role="status">
         <span className="visually-hidden">Loading...</span>
        </div>
       ) : (
        <tbody>
         {isShowResult ? coursesSearch.slice(startIndex, endIndex).map((course, index) => (
          <tr key={course.Id}>
           <th scope="row">{index + 1}</th>
           <td>{course.title}</td>
           <td>{new Date(course.updateAt).toLocaleDateString("vi-VN")}</td>
           <td>
            <button
             className="btn btn-primary btn-sm"
             onClick={() =>
              handleNavigate(
               `/admin/public-course/course-info/${course.Id}`
              )
             }
            >
             <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
            </button>
            &nbsp;
            <button
             className='btn btn-sm btn-danger mx-1'
             onClick={() => { setCourseID(course.Id); setuserID(course.userId); openModalDelete(); }}
            >
             Khóa
            </button>
           </td>
          </tr>
         )) : courses.slice(startIndex, endIndex).map((course, index) => (
          <tr key={course.Id}>
           <th scope="row">{index + 1}</th>
           <td>{course.title}</td>
           <td>{new Date(course.updateAt).toLocaleDateString("vi-VN")}</td>
           <td>
            <button
             className="btn btn-primary btn-sm"
             onClick={() =>
              handleNavigate(
               `/admin/public-course/course-info/${course.Id}`
              )
             }
            >
             <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
            </button>
            &nbsp;
            <button
             className='btn btn-sm btn-danger mx-1'
             onClick={() => { setCourseID(course.Id); setuserID(course.userId); openModalDelete(); }}
            >
             Khóa
            </button>
           </td>
          </tr>
         ))}
        </tbody>
       )}
      </table>
      <Pagination
       pageCount={Math.ceil((isShowResult
        ? coursesSearch.length
        : courses.length) / itemsPerPage)}
       handlePageClick={handlePageClick}
      />
     </div>
     {/* modal delete */}
     <Modal
      isOpen={modalDelete}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModalDelete}
      style={customStyles}
      contentLabel="Example Modal"
     >
      <h2
       style={{ fontWeight: "bold", color: "black", flex: "1" }}
       ref={(_subtitle) => (subtitle = _subtitle)}
      ></h2>
      <div
       style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
       }}
      >
       <h2
        style={{
         fontWeight: "bold",
         color: "black",
         flex: "1",
         fontSize: "1.25em",
        }}
       >
        Thông báo
       </h2>
       <FontAwesomeIcon icon={faClose} onClick={closeModalDelete} />
      </div>
      <div
       style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
       }}
       className="py-2 my-2"
      >
       <p>Bạn có chắc chắc muốn khóa khóa học này không?</p>
      </div>
      <textarea
       type="text"
       className="form-control pb-5 mb-5"
       placeholder="Nhập nội dung từ chối"
       name="contentRefuse"
       value={contentRefuse}
       onChange={(e) => setContenRefuse(e.target.value)}
       rows="2"
      />
      <div
       style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
       }}
      >
       <button
        onClick={() => {
         closeModalDelete();
         refuse();
        }}
        style={{
         width: "30%",
         padding: "10px",
         marginTop: "5px",
         borderRadius: "5px",
         backgroundColor: "red",
         color: "white",
         border: "none",
         cursor: "pointer",
         fontSize: "16px",
         fontWeight: "bold",
         boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
         transition: "background-color 0.3s",
        }}
       >
        Khóa
       </button>
       <button
        onClick={() => {
         closeModalDelete();
        }}
        style={{
         marginLeft: 50,
         width: "30%",
         padding: "10px",
         marginTop: "5px",
         borderRadius: "5px",
         backgroundColor: "#007bff",
         color: "white",
         border: "none",
         cursor: "pointer",
         fontSize: "16px",
         fontWeight: "bold",
         boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
         transition: "background-color 0.3s",
        }}
       >
        Thoát
       </button>
      </div>
     </Modal>
    </div>
   </main>
  </div>
 );
}
