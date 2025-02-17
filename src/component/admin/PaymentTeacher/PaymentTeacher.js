import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";
import Pagination from "../../Others/Pagination";
import "../User/manager-user.css";
import "../Notification/Notification.css";
import * as XLSX from 'xlsx';

export default function PaymentTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [teachersUnpaid, setTeachersUnpaid] = useState([]);
  const [teachersPaid, setTeachersPaid] = useState([]);
  const [teachersError, setTeachersError] = useState([]);
  const [courses, setCourses] = useState([]);

  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // lấy danh sách tất cả các giáo viên
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get("/users/allTeachers");
      const teachersData = response.data.map((teacher) => ({
        ...teacher,
        totalMoney: 0,
        isPayment: "",
        timePayment: "",
      }));

      // Tạo mảng promises cho các cuộc gọi API đồng thời
      const teacherPromises = teachersData.map((teacher) => {
        return getTeacherProperties(teacher.Id);
      });

      // Chờ tất cả các promise hoàn thành
      const coursesInfoArray = await Promise.all(teacherPromises);
      console.log("course info: ", coursesInfoArray);
      // Thêm thông tin vào mỗi giáo viên
      teachersData.forEach((teacher, index) => {
        const coursesInfo = coursesInfoArray[index];
        teacher.isPayment = coursesInfo.isPayment;
        teacher.totalMoney =
          (coursesInfo.totalMoney * teacher.commission) / 100;
        teacher.timePayment = coursesInfo.timePayment;
      });

      console.log("Teachers with courses info: ", teachersData);
      const filteredTeacherData = teachersData.filter((teacher) => {
        return teacher.totalMoney !== 0;
      });
      setTeachers(filteredTeacherData);
      // Lọc dữ liệu và đưa vào các mảng tương ứng
      const teachersUnpaid = teachersData.filter(
        (teacher) => teacher.isPayment === "unpaid" && teacher.totalMoney !== 0
      );
      const teachersPaid = teachersData.filter(
        (teacher) => teacher.isPayment === "paid" && teacher.totalMoney !== 0
      );
      const teachersError = teachersData.filter(
        (teacher) => teacher.isPayment === "error" && teacher.totalMoney !== 0
      );

      // Cập nhật state cho các mảng
      setTeachersUnpaid(teachersUnpaid);
      setTeachersPaid(teachersPaid);
      setTeachersError(teachersError);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

  // tạo 1 hàm giống y như vầy, cho thêm 1 tham số thời gian vào  getTeacherProperities
  const getTeacherProperties = async (teacherId) => {
    try {
      if (!startDate || !endDate) {
        return {
          isPayment: "",
          totalMoney: 0,
          timePayment: null,
        };
      }

      const start = formatDate(startDate.toLocaleDateString('en-GB', options));
      const end = formatDate(endDate.toLocaleDateString('en-GB', options));
      console.log("start date: ", start);
      console.log("end date: ", end);
      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${teacherId}?startDate=${start}&endDate=${end}`
      );
      console.log("mergedCourses : ", mergedCourses.data);

      let totalCourseUnpaid = 0;
      let totalCoursePaid = 0;
      let totalCourseError = 0;
      let timePayment;
      // chỗ này tiền sẽ cộng lại
      // Đoạn mã cần đo thời gian thực thi
      let totalMoney = 0;
      let totalMoneyUnpaid = 0;
      let totalMoneyPaid = 0;
      let totalMoneyError = 0;
      mergedCourses.data.forEach((course) => {
        course.courseRegisters.forEach((detail) => {
          const createAt = new Date(detail.createAt);

          if (createAt >= startDate && createAt <= endDate) {
            if (detail.payment === 0 || detail.payment === null) {
              totalCourseUnpaid++;
              totalMoneyUnpaid += course.promotional_price;
            } else if (detail.payment === 1) {
              totalCoursePaid++;
              totalMoneyPaid += course.promotional_price;
            } else if (detail.payment === 2) {
              totalCourseError++;
              totalMoneyError += course.promotional_price;
            }

            if (detail.paymentDay) {
              timePayment = detail.paymentDay;
            }
          }
        });
      });

      let maxVariable;
      let isPayment;
      if (
        totalCourseUnpaid === 0 &&
        totalCoursePaid === 0 &&
        totalCourseError === 0
      ) {
        maxVariable = 0;
        isPayment = "unpaid";
      } else {
        maxVariable = Math.max(
          totalCourseUnpaid,
          totalCoursePaid,
          totalCourseError
        );
        totalMoney = Math.max(
          totalMoneyUnpaid,
          totalMoneyPaid,
          totalMoneyError
        );
        if (maxVariable === totalCourseUnpaid) {
          isPayment = "unpaid";
        } else if (maxVariable === totalCoursePaid) {
          isPayment = "paid";
        } else if (maxVariable === totalCourseError) {
          isPayment = "error";
        }
      }

      return {
        isPayment: isPayment,
        totalMoney: totalMoney,
        timePayment: timePayment,
      };
    } catch (error) {
      console.error("Error fetching courses:", error);
      return {
        isPayment: "error",
        totalMoney: 0,
        timePayment: null,
      };
    }
  };

  // fetchCoursesByTeacherId

  const handleTeacherSelection = (teacherId) => {
    setSelectedTeacher(teachers.find((teacher) => teacher.Id === teacherId));
  };

  useEffect(() => {
    if (selectedTeacher) {
      const commission = selectedTeacher.commission || 0;
      const amountToPay = Math.floor((totalAmount * commission) / 100);
      setPaymentAmount(amountToPay);
    }
  }, [totalAmount, selectedTeacher]);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Tăng tháng hiện tại lên 1
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
  );
  const [startDate, setStartDate] = useState(
    new Date(currentYear, currentMonth - 1, 1)
  );
  const [endDate, setEndDate] = useState(
    new Date(currentYear, currentMonth, 0)
  );

  const handleDateChange = (event) => {
    setSelectedMonth(event.target.value);
    const selectedDate = new Date(event.target.value); // Lấy giá trị từ input date
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Ngày bắt đầu là ngày đầu tiên của tháng được chọn
    const startOfMonth = new Date(year, month, 1);
    setStartDate(startOfMonth);

    // Ngày cuối tháng là ngày cuối cùng của tháng được chọn
    const endOfMonth = new Date(year, month + 1, 0);
    setEndDate(endOfMonth);
  };
  useEffect(() => {
    fetchTeachers();
  }, [startDate, endDate]);

  let subtitle;
  const [modalDetail, setIsModalDetail] = useState(false);

  function openModalDetail() {
    setIsModalDetail(true);
  }
  function afterOpenModal() {
    subtitle.style.color = "#f00";
  }

  function closeModalDetail() {
    setIsModalDetail(false);
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      width: "55%",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  function formatDate(originalDateStr) {
    // Tách chuỗi ngày thành các phần tử
    const parts = originalDateStr.split("/");

    // Sắp xếp lại các phần tử theo đúng thứ tự và thêm số 0 phía trước nếu cần
    const formattedDate = `${parts[2].padStart(4, "0")}-${parts[1].padStart(
      2,
      "0"
    )}-${parts[0].padStart(2, "0")}`;

    return formattedDate;
  }

  // filter
  const [selectedRole, setSelectedRole] = useState(""); // State mới để lưu trữ giá trị được chọn từ combobox

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
  };

  const [selectedAction, setSelectedAction] = useState(""); // State mới để lưu trữ giá trị được chọn từ combobox

  const handleActionChange = async (e) => {
    const newAction = e.target.value;
    setSelectedAction(newAction);
  };

  useEffect(() => {
    console.log("selected action: ", selectedAction);
  }, [selectedAction]);

  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

  const handlePay = async (teacherId) => {
    try {
      // lấy ra id của teacher Đó
      // duyệt chi tiết các khóa học trong khoảng thời gian theo teacherID
      // tạo mảng để xử lý đa luồng
      // gọi hàm cập nhật payment
      setIsLoading(true);
      const start = formatDate(startDate.toLocaleDateString('en-GB', options));
      const end = formatDate(endDate.toLocaleDateString('en-GB', options));

      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${teacherId}?startDate=${start}&endDate=${end}`
      );

      let selectedCourse = [];

      // Duyệt qua mảng courseDetails trong mergedCourses.data
      mergedCourses.data.forEach((course) => {
        // Duyệt qua mảng courseDetails của mỗi course
        course.courseRegisters.forEach((courseDetail) => {
          // Lấy thuộc tính Id của courseDetail và thêm vào mảng selectedCourse
          selectedCourse.push(courseDetail.Id);
        });
      });
      // Tạo mảng promises từ mảng selectedCourse
      const promises = selectedCourse.map((Id) =>
        axiosClient.patch(`/courseRegisters/${Id}`, {
          payment: 1,
          paymentDay: new Date().toISOString(),
        })
      );

      await Promise.all(promises);
      setNotification({
        type: "success",
        message: "Cập nhật thành công",
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000); // Ẩn đi sau 3 giây (3000 milliseconds)
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.Id === teacherId ? { ...teacher, isPayment: "paid" , paymentDay: new Date().toISOString() } : teacher
        )
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

  const handleCancel = async (teacherId) => {
    try {
      // lấy ra id của teacher Đó
      // duyệt chi tiết các khóa học trong khoảng thời gian theo teacherID
      // tạo mảng để xử lý đa luồng
      // gọi hàm cập nhật payment
      setIsLoading(true);
      const start = formatDate(startDate.toLocaleDateString('en-GB', options));
      const end = formatDate(endDate.toLocaleDateString('en-GB', options));

      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${teacherId}?startDate=${start}&endDate=${end}`
      );

      let selectedCourse = [];

      // Duyệt qua mảng courseDetails trong mergedCourses.data
      mergedCourses.data.forEach((course) => {
        // Duyệt qua mảng courseDetails của mỗi course
        course.courseRegisters.forEach((courseDetail) => {
          // Lấy thuộc tính Id của courseDetail và thêm vào mảng selectedCourse
          selectedCourse.push(courseDetail.Id);
        });
      });
      // Tạo mảng promises từ mảng selectedCourse
      const promises = selectedCourse.map((Id) =>
        axiosClient.patch(`/courseRegisters/${Id}`, {
          payment: 0,
          paymentDay: new Date().toISOString(),
        })
      );

      await Promise.all(promises);
      setNotification({
        type: "success",
        message: "Hủy thành công",
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000); // Ẩn đi sau 3 giây (3000 milliseconds)
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.Id === teacherId
            ? { ...teacher, isPayment: "unpaid", paymentDay: new Date().toISOString() }
            : teacher
        )
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

  const handleDetail = async (teacherId) => {
    try {
      setIsLoading(true);
      if (!startDate || !endDate) {
        return;
      }

      const start = formatDate(startDate.toLocaleDateString('en-GB', options));
      const end = formatDate(endDate.toLocaleDateString('en-GB', options));

      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${teacherId}?startDate=${start}&endDate=${end}`
      );
      setCourses(mergedCourses.data);
      handleTeacherSelection(teacherId);
      console.log("details :", mergedCourses.data);
      setIsLoading(false);
      openModalDetail();
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
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

  //
  const TeacherRow = ({ teacher, handlePay, handleCancel, handleDetail }) => {
    return (
      <tr key={teacher.Id}>
        <td
          style={{
            maxWidth: "150px",
            wordWrap: "break-word",
            fontSize: "15px",
          }}
        >
          {teacher.bank_name}
        </td>
        <td style={{ fontSize: "15px" }}>{teacher.account_number}</td>
        <td style={{ fontSize: "15px" }}>{teacher.account_name}</td>
        <td style={{ fontSize: "15px" }}>{teacher.commission}%</td>
        <td style={{ fontSize: "15px" }}>{teacher.totalMoney}</td>
        <td style={{ fontSize: "15px", fontWeight: "bold" }}>
          {teacher.isPayment === "unpaid" ? (
            <p className="text-primary">Chưa thanh toán</p>
          ) : teacher.isPayment === "paid" ? (
            <p className="text-success">Đã thanh toán</p>
          ) : teacher.isPayment === "error" ? (
            <p className="text-danger">Lỗi</p>
          ) : (
            ""
          )}
        </td>
        <td>
          {teacher.isPayment === "paid" && teacher.timePayment
            ? new Date(teacher.timePayment).toLocaleDateString('en-GB', options)
            : ""}
        </td>
        <td>
          <Dropdown className="mx-2">
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              Hành động
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {teacher.isPayment === "unpaid" ? (
                <Dropdown.Item
                  onClick={() => {
                    handlePay(teacher.Id);
                  }}
                >
                  Thanh toán
                </Dropdown.Item>
              ) : teacher.isPayment === "paid" ? (
                <Dropdown.Item
                  onClick={() => {
                    handleCancel(teacher.Id);
                  }}
                >
                  Hủy thanh toán
                </Dropdown.Item>
              ) : teacher.isPayment === "error" ? (
                <Dropdown.Item
                  onClick={() => {
                    handlePay(teacher.Id);
                  }}
                >
                  Thanh toán
                </Dropdown.Item>
              ) : (
                ""
              )}
              <Dropdown.Item
                onClick={() => {
                  handleDetail(teacher.Id);
                  setSelectedCommission(teacher.commission);
                  setSelectedPrice(teacher.totalMoney);
                }}
              >
                Chi tiết
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    );
  };

  // search
  const [teachersSearch, setTeachersSearch] = useState([]);
  const [teachersSearchUnpaid, setTeachersSearchUnpaid] = useState([]);
  const [teachersSearchPaid, setTeachersSearchPaid] = useState([]);
  const [teachersSearchError, setTeachersSearchError] = useState([]);
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
      // Kiểm tra nếu search không phải là null hoặc undefined

      // nếu như filter là cái gì thì mới lọc cái đó
      // thêm điều kiện selectedRole để filter các khóa phù hợp
      if (selectedRole === "") {
        if (search !== null && search !== undefined && search.trim() !== "") {
          const filteredUsers = teachers.filter((user) => {
            const accountName = user?.account_name?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            const accountNumber = user?.account_number?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            return (
              accountName.includes(search.toLowerCase()) ||
              accountNumber.includes(search.toLowerCase())
            );
          });
          setIsLoading(false);
          setTeachersSearch(filteredUsers);
          setIsShowResult(true);

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
      } else if (selectedRole === "paid") {
        if (search !== null && search !== undefined && search.trim() !== "") {
          const filteredUsers = teachersPaid.filter((user) => {
            const accountName = user?.account_name?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            const accountNumber = user?.account_number?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            return (
              accountName.includes(search.toLowerCase()) ||
              accountNumber.includes(search.toLowerCase())
            );
          });
          setIsLoading(false);
          setTeachersSearchPaid(filteredUsers);
          setIsShowResult(true);
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
      } else if (selectedRole === "unpaid") {
        if (search !== null && search !== undefined && search.trim() !== "") {
          const filteredUsers = teachersUnpaid.filter((user) => {
            const accountName = user?.account_name?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            const accountNumber = user?.account_number?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            return (
              accountName.includes(search.toLowerCase()) ||
              accountNumber.includes(search.toLowerCase())
            );
          });
          setIsLoading(false);
          setTeachersSearchUnpaid(filteredUsers);
          setIsShowResult(true);
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
      } else if (selectedRole === "error") {
        if (search !== null && search !== undefined && search.trim() !== "") {
          const filteredUsers = teachersError.filter((user) => {
            const accountName = user?.account_name?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            const accountNumber = user?.account_number?.toLowerCase() || ""; // Kiểm tra và đặt giá trị mặc định là chuỗi rỗng
            return (
              accountName.includes(search.toLowerCase()) ||
              accountNumber.includes(search.toLowerCase())
            );
          });
          setIsLoading(false);
          setTeachersSearchError(filteredUsers);
          setIsShowResult(true);
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
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching users:", error);
    }
  };
  const [isShowResult, setIsShowResult] = useState(false);

  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedCommission, setSelectedCommission] = useState(null);

  // excel
  const handleExport = () => {
    const columnMapping = {
      bank_name: "Tên ngân hàng",
      account_number: "Số tài khoản",
      account_name: "Tên tài khoản",
      totalMoney: "Số tiền",
      commission: "Hoa hồng",
      isPayment: "Trạng thái",
      timePayment: "Thời gian thanh toán"
    };

    const filteredData = teachers.map(teacher => ({
      bank_name: teacher.bank_name,
      account_number: teacher.account_number,
      account_name: teacher.account_name,
      commission: teacher.commission,
      totalMoney: teacher.totalMoney,
      isPayment: teacher.isPayment === "unpaid" ? 'Chưa thanh toán'        
      : teacher.isPayment === "paid" ? 'Đã thanh toán' : teacher.isPayment === "error" ? 'Lỗi' : '',
      timePayment: teacher.isPayment === "paid" && teacher.timePayment
        ? new Date(teacher.timePayment).toLocaleDateString('en-GB', options)
        : "",
    }));

    // Đổi tên cột thành tiếng Việt
    const filteredDataWithVietnameseHeaders = filteredData.map(item => {
      const newItem = {};
      Object.keys(item).forEach(key => {
        newItem[columnMapping[key]] = item[key];
      });
      return newItem;
    });

    const ws = XLSX.utils.json_to_sheet(filteredDataWithVietnameseHeaders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
    XLSX.writeFile(wb, 'PaymentInfo.xlsx');
  };

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        <div className="row mb-4">
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
              {notification && (
                <div className={`notification ${notification.type}`}>
                  {notification.message}
                </div>
              )}
              <h5 className="mb-0 d-inline-block">Thanh toán hoa hồng</h5>
              {isLoading ? (
                <div class="spinner-border text-primary ml-5" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div></div>
              )}
              <div className="flex-row">
                <button className="btn btn-sm mx-5" onClick={handleExport}>Xuất file&nbsp;<FontAwesomeIcon icon={faFileExcel} size="25"/></button>
                <label className="fw-bold" htmlFor="paymentStatus">
                  Lọc:
                </label>
                <select
                  className="custom-select"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <option value=""></option>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="error">Lỗi</option>
                  {/* <option value="error">Tất cả lỗi</option>
                  <option value="error">Tất cả chưa thanh toán</option> */}
                </select>
              </div>
              <div>
                <input
                  type="month"
                  id="dateEnd"
                  name="dateEnd"
                  value={selectedMonth}
                  onChange={handleDateChange}
                />
                {/* {startDate && endDate && (
                  <div>
                    <p>Ngày bắt đầu: {startDate.toLocaleDateString()}</p>
                    <p>Ngày cuối tháng: {endDate.toLocaleDateString()}</p>
                  </div>
                )} */}
              </div>
            </div>
            <div className="card-body">
              <table className="table table-hover ">
                <thead>
                  <tr>
                    <th scope="col">Ngân hàng</th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Số tài khoản
                    </th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Tên tài khoản
                    </th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Tỷ lệ hoa hồng
                    </th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Số tiền
                    </th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Trạng thái
                    </th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Thời gian thanh toán
                    </th>
                    <th style={{ whiteSpace: "nowrap" }} scope="col">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    selectedRole === "" ? ( // Kiểm tra nếu không có role được chọn, hiển thị tất cả giáo viên
                      isShowResult ? ( // Nếu isShowResult là true, hiển thị teachersSearch, ngược lại hiển thị teachers
                        teachersSearch
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      ) : (
                        teachers
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      )
                    ) : selectedRole === "unpaid" ? ( // Hiển thị danh sách giáo viên chưa thanh toán
                      isShowResult ? ( // Nếu isShowResult là true, hiển thị teachersSearch, ngược lại hiển thị teachers
                        teachersSearchUnpaid
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      ) : (
                        teachersUnpaid
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      )
                    ) : selectedRole === "paid" ? ( // Hiển thị danh sách giáo viên đã thanh toán
                      isShowResult ? ( // Nếu isShowResult là true, hiển thị teachersSearch, ngược lại hiển thị teachers
                        teachersSearchPaid
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      ) : (
                        teachersPaid
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      )
                    ) : selectedRole === "error" ? ( // Hiển thị danh sách giáo viên có lỗi
                      isShowResult ? ( // Nếu isShowResult là true, hiển thị teachersSearch, ngược lại hiển thị teachers
                        teachersSearchError
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      ) : (
                        teachersError
                          .slice(startIndex, endIndex)
                          .map((teacher, index) => (
                            <TeacherRow
                              key={teacher.Id}
                              teacher={teacher}
                              handlePay={handlePay}
                              handleCancel={handleCancel}
                              handleDetail={handleDetail}
                            />
                          ))
                      )
                    ) : (
                      <div
                        class="spinner-border text-primary ml-5"
                        role="status"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    ) // Trường hợp mặc định, không hiển thị dữ liệu
                  }
                </tbody>
              </table>

              <Pagination
                pageCount={
                  selectedRole === "" // Kiểm tra nếu không có role được chọn, hiển thị tất cả giáo viên
                    ? Math.ceil(
                        (isShowResult
                          ? teachersSearch.length
                          : teachers.length) / itemsPerPage
                      )
                    : selectedRole === "unpaid" // Hiển thị danh sách giáo viên chưa thanh toán
                    ? Math.ceil(
                        (isShowResult
                          ? teachersSearchUnpaid.length
                          : teachersUnpaid.length) / itemsPerPage
                      )
                    : selectedRole === "paid" // Hiển thị danh sách giáo viên đã thanh toán
                    ? Math.ceil(
                        (isShowResult
                          ? teachersSearchPaid.length
                          : teachersPaid.length) / itemsPerPage
                      )
                    : selectedRole === "error" // Hiển thị danh sách giáo viên có lỗi
                    ? Math.ceil(
                        (isShowResult
                          ? teachersSearchError.length
                          : teachersError.length) / itemsPerPage
                      )
                    : 0 // Trường hợp mặc định, không hiển thị dữ liệu
                }
                handlePageClick={handlePageClick}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>

        <div>
          <Modal
            isOpen={modalDetail}
            onAfterOpen={afterOpenModal}
            onRequestClose={() => {
              closeModalDetail();
            }}
            style={customStyles}
            contentLabel="Example Modal"
          >
            {/* Phần còn lại của modal */}
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
              {/* Button close và tiêu đề */}
              <h2
                style={{
                  fontWeight: "bold",
                  color: "black",
                  flex: "1",
                  fontSize: "1.25em",
                }}
              >
                Chi tiết
              </h2>

              <FontAwesomeIcon
                icon={faClose}
                onClick={() => {
                  closeModalDetail();
                }}
              />
            </div>
            <div className="card mb-4">
              <div className="d-flex flex-row">
                <div>
                  <p>
                    Giảng viên:{" "}
                    {selectedTeacher ? selectedTeacher.fullname : ""}
                  </p>
                  <p>Email: {selectedTeacher ? selectedTeacher.email : ""}</p>
                  <p>
                    Số điện thoại:{" "}
                    {selectedTeacher ? selectedTeacher.phone : ""}
                  </p>
                </div>
                {selectedPrice &&
                  selectedCommission &&
                  !isNaN(selectedPrice) &&
                  !isNaN(selectedCommission) && (
                    <div className="mx-5">
                      <p>
                        Doanh thu: {(selectedPrice / selectedCommission) * 100}{" "}
                        đ
                      </p>
                      <p>Chi phí hoa hồng: {selectedPrice} đ</p>
                      <p>
                        Lợi nhuận:{" "}
                        {(selectedPrice / selectedCommission) * 100 -
                          selectedPrice}
                      </p>
                    </div>
                  )}
              </div>
              <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h7 className="mb-0 d-inline-block">Danh sách các khóa học</h7>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Khóa học</th>
                      <th scope="col">Giá</th>
                      <th scope="col">Ngày mua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <React.Fragment key={course.courseId}>
                        {course.courseRegisters.map((detail, index) => {
                          const createAt = new Date(detail.createAt);
                          return (
                            <tr key={`${course.courseId}-${index}`}>
                              <td>{index}</td>
                              <td>{course.title}</td>
                              <td>
                                {course.promotional_price.toLocaleString(
                                  "vi-VN"
                                )}
                              </td>
                              <td>{`${createAt.getDate()}/${
                                createAt.getMonth() + 1
                              }/${createAt.getFullYear()}`}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
}