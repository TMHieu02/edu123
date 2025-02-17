import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faClose } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "./manager-user.css";
import "../Notification/Notification.css";
import Pagination from "../../Others/Pagination";
import Modal from "react-modal";
export default function ManagerUser() {
  const handleNavigate = (path) => {
    window.open(path, "_blank");
  };

  const [users, setUsers] = useState([]);
  const [teacher, setTeacher] = useState([]);
  const [usersSearch, setUsersSearch] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState([]);
  const [isShowResult, setIsShowResult] = useState(false);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    const inputValue = e.target.value;
    if (
      inputValue === null ||
      inputValue === undefined ||
      inputValue.trim() === ""
    ) {
      setIsShowResult(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState("user"); // State mới để lưu trữ giá trị được chọn từ combobox

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
  };
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      if (selectedRole === "lecturer") {
        if (search !== null && search !== undefined && search.trim() !== "") {
          const filteredTeachers = teacher.filter((user) => {
            const accountName = user?.fullname?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            const accountEmail = user?.email?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            return (
              accountName.includes(search.toLowerCase()) ||
              accountEmail.includes(search.toLowerCase())
            );
          });
          setIsLoading(false);
          setTeacherSearch(filteredTeachers);
          setIsShowResult(true);
          setCurrentPage(0);          
          if (filteredTeachers.length === 0) {
            setNotification({
              type: "success",
              message:
                "Không tìm thấy người dùng với tên hoặc email: " + search,
            });
            setTimeout(() => {
              setNotification(null);
            }, 3000);
          } else {
            console.log("teacher result: ", filteredTeachers);
            setNotification(null);
          }
        } else {
          setIsShowResult(false);
          setIsLoading(false);
          console.log("Error fetching users: Search is null or undefined");
        }
      } else if (selectedRole === "user") {
        if (search !== null && search !== undefined && search.trim() !== "") {
          const filteredUsers = users.filter((user) => {
            const accountName = user?.fullname?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            const accountEmail = user?.email?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            return (
              accountName.includes(search.toLowerCase()) ||
              accountEmail.includes(search.toLowerCase())
            );
          });
          setIsLoading(false);
          setUsersSearch(filteredUsers);
          setIsShowResult(true);
          setCurrentPage(0);          
          if (filteredUsers.length === 0) {
            setNotification({
              type: "success",
              message:
                "Không tìm thấy người dùng với tên hoặc email: " + search,
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
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching users:", error);
    }
  };

  function getRoleName(roleId) {
    switch (roleId) {
      case 1:
        return "Người dùng";
      case 2:
        return "Giảng viên";
      case 3:
        return "Admin";
      case 4:
        return "Người dùng";
      default:
        return "Không xác định";
    }
  }

  const handleToggleLock = async (userId, isDeleted, email) => {
    try {
      console.log(isDeleted);

      let response;

      if (isDeleted) {
        setIsLoading(true);
        response = await axiosClient.patch(`/users/unlock-account/${userId}`);
        getData();
        setIsLoading(false);
        setTimeout(() => {          
          setNotification({
            type: "success",
            message: "Mở khóa tài khoản người dùng thành công!",
          });
        }, 3000);
        try {
          await axiosClient.post(
           `/auth/send/message/title/${email}`,
           {
            message: "Your account has been successfully unlocked. You can now access all your courses.",
            title: "EDU123 - ACCOUNT UNLOCKED"            
           }
          );
         } catch (error) {
    
         }
      } else {
        console.log(userId);
        setIsLoading(true);
        setUserID(userId);
        setEmail(email);
        setContenRefuse('');
        openModalDelete();        
      }  
      setTimeout(() => {
        setNotification(null);
      }, 5000);    
    } catch (error) {
      console.error("Error updating role or sending message:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi, vui lòng thử lại",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      // Tắt trạng thái isLoading sau cùng để đảm bảo nó luôn được thực hiện
      handleSearch(); // Bạn cũng có thể muốn đợi kết quả của handleSearch nếu nó là async
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

  const getData = async () => {
    try {
      setIsLoading(true);
      const responseUser = await axiosClient.get(`/users/role=1`);
      let userData = responseUser.data.sort((a, b) => {
        return new Date(b.updateAt) - new Date(a.updateAt);
      });
      setUsers(userData);

      const responseTeacher = await axiosClient.get(`/users/role=2`);
      let teacherData = responseTeacher.data.sort((a, b) => {
        return new Date(b.updateAt) - new Date(a.updateAt);
      });
      setTeacher(teacherData);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  //modal lock account
  const [contentRefuse, setContenRefuse] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [userID, setUserID] = useState(''); 
  const lock = async () => {
    try {      
        let response;              
        setIsLoading(true);
        response = await axiosClient.patch(`/users/lock-account/${userID}`);
        getData();
        setIsLoading(false);
        setTimeout(() => {          
          setNotification({
            type: "success",
            message: "Đã khóa tài khoản người dùng thành công!",
          });
        }, 3000);
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
            title: "EDU123 - ACCOUNT LOCK"            
           }
          );
         } catch (error) {
    
         }

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error updating role or sending message:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi, vui lòng thử lại",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      // Tắt trạng thái isLoading sau cùng để đảm bảo nó luôn được thực hiện
      handleSearch(); // Bạn cũng có thể muốn đợi kết quả của handleSearch nếu nó là async
    }
  };


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
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-inline-block">
              Danh sách {selectedRole === "user" ? "người dùng" : "giảng viên"}{" "}
            </h5>
            {isLoading ? (
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            ) : (
              <div></div>
            )}
            <div>
              <select
                className="custom-select"
                value={selectedRole}
                onChange={handleRoleChange}
              >
                <option value="user">Người dùng</option>
                <option value="lecturer">Giảng viên</option>
              </select>
            </div>
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
                  <th scope="col">Họ và tên</th>
                  <th scope="col">Email</th>
                  <th scope="col">Ngày cập nhật</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Quyền</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {selectedRole === "user"
                  ? isShowResult
                    ? usersSearch
                        .slice(startIndex, endIndex)
                        .map((user, index) => (
                          <tr key={user.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{user.fullname}</td>
                            <td>{user.email}</td>
                            <td>
                              {new Date(user.updateAt).toLocaleString("vi-VN")}
                            </td>
                            <td>
                              {user.isDeleted === true
                                ? "Bị khóa"
                                : "Đang hoạt động"}
                            </td>
                            <td>{getRoleName(user.roleId)}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  handleNavigate(`/admin/user-info/${user.Id}`)
                                }
                              >
                                <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                              </button>
                              &nbsp;
                              <button
                                className={`btn btn-sm ${
                                  user.isDeleted === true
                                    ? "btn-success"
                                    : "btn-danger"
                                }`}
                                onClick={() =>
                                  handleToggleLock(user.Id, user.isDeleted, user.email)
                                }
                              >
                                {user.isDeleted === true ? "Mở khóa" : "Khóa"}
                              </button>
                            </td>
                          </tr>
                        ))
                    : users.slice(startIndex, endIndex).map((user, index) => (
                        <tr key={user.id}>
                          <th scope="row">{index + 1}</th>
                          <td>{user.fullname}</td>
                          <td>{user.email}</td>
                          <td>
                            {new Date(user.updateAt).toLocaleString("vi-VN")}
                          </td>
                          <td>
                            {user.isDeleted === true
                              ? "Bị khóa"
                              : "Đang hoạt động"}
                          </td>
                          <td>{getRoleName(user.roleId)}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleNavigate(`/admin/user-info/${user.Id}`)
                              }
                            >
                              <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                            </button>
                            &nbsp;
                            <button
                              className={`btn btn-sm ${
                                user.isDeleted === true
                                  ? "btn-success"
                                  : "btn-danger"
                              }`}
                              onClick={() =>
                                handleToggleLock(user.Id, user.isDeleted, user.email)
                              }
                            >
                              {user.isDeleted === true ? "Mở khóa" : "Khóa"}
                            </button>
                          </td>
                        </tr>
                      ))
                  : selectedRole === "lecturer"
                  ? isShowResult
                    ? teacherSearch
                        .slice(startIndex, endIndex)
                        .map((user, index) => (
                          <tr key={user.id}>
                            <th scope="row">{index + 1}</th>
                            <td>{user.fullname}</td>
                            <td>{user.email}</td>
                            <td>
                              {new Date(user.updateAt).toLocaleString("vi-VN")}
                            </td>
                            <td>
                              {user.isDeleted === true
                                ? "Bị khóa"
                                : "Đang hoạt động"}
                            </td>
                            <td>{getRoleName(user.roleId)}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  handleNavigate(`/admin/user-info/${user.Id}`)
                                }
                              >
                                <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                              </button>
                              &nbsp;
                              <button
                                className={`btn btn-sm ${
                                  user.isDeleted === true
                                    ? "btn-success"
                                    : "btn-danger"
                                }`}
                                onClick={() =>
                                  handleToggleLock(user.Id, user.isDeleted, user.email)
                                }
                              >
                                {user.isDeleted === true ? "Mở khóa" : "Khóa"}
                              </button>
                            </td>
                          </tr>
                        ))
                    : teacher.slice(startIndex, endIndex).map((user, index) => (
                        <tr key={user.id}>
                          <th scope="row">{index + 1}</th>
                          <td>{user.fullname}</td>
                          <td>{user.email}</td>
                          <td>
                            {new Date(user.updateAt).toLocaleString("vi-VN")}
                          </td>
                          <td>
                            {user.isDeleted === true
                              ? "Bị khóa"
                              : "Đang hoạt động"}
                          </td>
                          <td>{getRoleName(user.roleId)}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleNavigate(`/admin/user-info/${user.Id}`)
                              }
                            >
                              <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                            </button>
                            &nbsp;
                            <button
                              className={`btn btn-sm ${
                                user.isDeleted === true
                                  ? "btn-success"
                                  : "btn-danger"
                              }`}
                              onClick={() =>
                                handleToggleLock(user.Id, user.isDeleted, user.email)
                              }
                            >
                              {user.isDeleted === true ? "Mở khóa" : "Khóa"}
                            </button>
                          </td>
                        </tr>
                      ))
                  : null}
              </tbody>
            </table>
            <Pagination
              pageCount={
                selectedRole === "user"
                  ? Math.ceil(
                      (isShowResult ? usersSearch.length : users.length) /
                        itemsPerPage
                    )
                  : selectedRole === "lecturer"
                  ? Math.ceil(
                      (isShowResult ? teacherSearch.length : teacher.length) /
                        itemsPerPage
                    )
                  : 0
              }
              handlePageClick={handlePageClick}
              currentPage={currentPage}
            />
          </div>
        </div>
      </main>
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
       <p>Bạn có chắc chắc muốn khóa tài khoản này không?</p>
      </div>
      <textarea
       type="text"
       className="form-control pb-5 mb-5"
       placeholder="Nhập lý do"
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
         lock();
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
  );
}
