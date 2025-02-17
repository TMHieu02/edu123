import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import "../../admin/Notification/Notification.css";
import Header from "../Header/Header";
import { Dropdown } from "react-bootstrap";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
export default function PaymentControl() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* tạo danh sách các dữ liệu cần cho đối soát giảng viên: 
    -số tiền 
    -thời gian (tính theo tháng)
    -thời gian chuyển tiền
    -tỷ lệ hoa hồng lấy riêng ở ngoài 
    -có chữ clear thì ko chọn tháng nữa 
    -hiển thị tất cả chỗ selected option
    -chọn tháng đến hiện tại 
  */

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Tăng tháng hiện tại lên 1
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
  );
  const [selectedYear, setSeletedYear] = useState(`${currentYear}`);
  // 2024-04

  const handleDateChange = (event) => {
    setSeletedYear(event.target.value);
    setSelectedMonth(event.target.value);

    // nếu như chọn cái năm trùng với năm hiện tại
    if (event.target.value == currentYear) {
      console.log("trùng với với năm hiện tại!");
      setSelectedMonth(
        `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
      );
    } else {
      console.log("ko trùng với với năm hiện tại!");
      setSelectedMonth(`${event.target.value}-12`);
    }
    console.log("event target value: ", event.target.value);
    const selectedDate = new Date(event.target.value); // Lấy giá trị từ input date
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    console.log("selected date: ", selectedDate);
    console.log("year: ", year);
    console.log("month: ", month);
  };

  const generateTimeDisplay = (selectedMonth) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const months = [];

    // Duyệt từ tháng 1 đến tháng đã chọn
    for (let m = month; m >= 1; m--) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0); // Lấy ngày cuối cùng của tháng

      // Tạo chuỗi ngày tháng năm theo định dạng yyyy-MM-dd
      const startFormatted = formatDateFunction(startDate.toLocaleDateString());
      const endFormatted = formatDateFunction(endDate.toLocaleDateString());
      console.log("start format: ", startFormatted);
      const monthData = {
        startDate: startFormatted,
        endDate: endFormatted,
      };

      months.push(monthData);
    }
    console.log("month array: ", months);
    return months;
  };

  // Hàm để chuyển đổi định dạng ngày
  const formatDateFunction = (dateString) => {
    const [month, day, year] = dateString
      .split("/")
      .map((item) => item.padStart(2, "0"));
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]); // useEffect này chạy mỗi khi selectedMonth thay đổi

  const [data, setData] = useState([]);
  const [dataPaid, setDataPaid] = useState([]);
  const [dataUnpaid, setDataUnpaid] = useState([]);
  const [dataError, setDataError] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      const timeDisplay = generateTimeDisplay(selectedMonth);

      const responseUser = await axiosClient.get(`/users/${userId}`);
      const commission = responseUser.data.commission;

      // cần dữ liệu commison trước khi gọi các ham dưới
      const promises = timeDisplay.map((item) => {
        return getTeacherProperties(
          userId,
          item.startDate,
          item.endDate,
          commission
        );
      });

      const coursesInfoArray = await Promise.all(promises);
      console.log("course info: ", coursesInfoArray);

      setData(coursesInfoArray);
      // Lọc dữ liệu và đưa vào các mảng tương ứng
      const dataUnpaid = coursesInfoArray.filter(
        (teacher) => teacher.isPayment === "unpaid" && teacher.totalMoney !== 0
      );
      const dataPaid = coursesInfoArray.filter(
        (teacher) => teacher.isPayment === "paid" && teacher.totalMoney !== 0
      );
      const dataError = coursesInfoArray.filter(
        (teacher) => teacher.isPayment === "error" && teacher.totalMoney !== 0
      );

      // Cập nhật state cho các mảng
      setDataUnpaid(dataUnpaid);
      setDataPaid(dataPaid);
      setDataError(dataError);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };
  const getTeacherProperties = async (
    teacherId,
    startDate,
    endDate,
    commission
  ) => {
    try {
      console.log("start date function: ", startDate);
      console.log("end date function: ", endDate);
      if (!startDate || !endDate) {
        return {
          isPayment: "",
          totalMoney: 0,
          time: null,
          timePayment: null,
        };
      }
      console.log("start date function: ", startDate);
      console.log("end date function: ", endDate);
      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${teacherId}?startDate=${startDate}&endDate=${endDate}`
        // `/courseRegisters/payment/teacherWithCourses/10?startDate=2024-05-01&endDate=2024-05-31`
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
          (totalMoneyUnpaid * commission) / 100,
          (totalMoneyPaid * commission) / 100,
          (totalMoneyError * commission) / 100
        );
        if (maxVariable === totalCourseUnpaid) {
          isPayment = "unpaid";
        } else if (maxVariable === totalCoursePaid) {
          isPayment = "paid";
        } else if (maxVariable === totalCourseError) {
          isPayment = "error";
        }
      }
      let timeMonthYear = formatMonthYear(startDate);
      return {
        isPayment: isPayment,
        totalMoney: totalMoney,
        time: timeMonthYear,
        timePayment: timePayment,
      };
    } catch (error) {
      console.error("Error fetching courses:", error);
      return {
        isPayment: "error",
        totalMoney: 0,
        time: null,
        timePayment: null,
      };
    }
  };
  const formatMonthYear = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month.padStart(2, "0")}/${year}`;
  };

  const handleDetail = async (time) => {
    try {
      setIsLoading(true);
      console.log("time: ", time);
      // Tạo biến startDate từ chuỗi time
      const [month, year] = time.split("/");
      const startDate = `${year}-${month.padStart(2, "0")}-01`; // Thêm số 0 nếu cần

      // Tạo biến endDate từ chuỗi time
      const lastDayOfMonth = new Date(year, month, 0).getDate(); // Lấy ngày cuối cùng của tháng
      const endDate = `${year}-${month.padStart(2, "0")}-${lastDayOfMonth}`;

      console.log("startDate: ", startDate);
      console.log("endDate: ", endDate);

      if (!startDate || !endDate) {
        return;
      }
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);

      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${userId}?startDate=${startDate}&endDate=${endDate}`
      );
      setCourses(mergedCourses.data);

      console.log("details :", mergedCourses.data);
      setIsLoading(false);
      openModalDetail();
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

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

  const TeacherRow = ({ item, index, handleDetail, handleError }) => {
    return (
      <tr key={index}>
        <td>{item.time}</td>
        <td>{item.totalMoney}</td>
        <td>
          {item.isPayment === "unpaid" && item.totalMoney != 0 ? (
            <p className="text-primary">Chưa thanh toán</p>
          ) : item.isPayment === "paid" ? (
            <p className="text-success">Đã thanh toán</p>
          ) : item.isPayment === "error" ? (
            <p className="text-danger">Lỗi</p>
          ) : (
            ""
          )}
        </td>
        <td>
          {item.isPayment === "paid" && item.timePayment
            ? new Date(item.timePayment).toLocaleString()
            : ""}
        </td>
        <td>
          <Dropdown className="mx-2">
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              Hành động
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {item.isPayment === "paid" && (
                <Dropdown.Item
                  onClick={() => {
                    handleError(index, item.time);
                  }}
                >
                  Báo lỗi
                </Dropdown.Item>
              )}
              <Dropdown.Item
                onClick={() => {
                  handleDetail(item.time);
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

  const [selectedRole, setSelectedRole] = useState(""); // State mới để lưu trữ giá trị được chọn từ combobox

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
  };

  const handleError = async (index, time) => {
    try {
      setIsLoading(true);
      console.log("index: ", index);
      // Tạo biến startDate từ chuỗi time
      const [month, year] = time.split("/");
      const startDate = `${year}-${month.padStart(2, "0")}-01`; // Thêm số 0 nếu cần

      // Tạo biến endDate từ chuỗi time
      const lastDayOfMonth = new Date(year, month, 0).getDate(); // Lấy ngày cuối cùng của tháng
      const endDate = `${year}-${month.padStart(2, "0")}-${lastDayOfMonth}`;

      console.log("startDate: ", startDate);
      console.log("endDate: ", endDate);
      if (!startDate || !endDate) {
        return;
      }
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${userId}?startDate=${startDate}&endDate=${endDate}`
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
          payment: 2,
          paymentDay: new Date().toISOString(),
        })
      );

      await Promise.all(promises);

      setData((prevTeachers) =>
        prevTeachers.map((teacher, indexData) =>
          indexData === index ? { ...teacher, isPayment: "error" } : teacher
        )
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

  const handleNavigate = (path) => {
    window.open(path, "_blank");
  };

  return (
    <div>
      <Header />
      <div className="manager-user-layout">
        <main className="manager-user-main-content col-md-8">
          <div className="row mb-4"></div>
          <div className="container">
            <div className="row justify-content-left">
              <div className="col-md-6">
                <div className="card p-3 mb-3">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center">
                      <label
                        className="fw-bold "
                        style={{ whiteSpace: "nowrap" }}
                        htmlFor="dateEnd"
                      >
                        Chọn năm:&nbsp;
                      </label>
                      <input
                        type="number"
                        id="dateEnd"
                        name="dateEnd"
                        value={selectedYear}
                        onChange={handleDateChange}
                        placeholder="Nhập năm"
                        min="1900"
                        max="2100"
                        className="form-control"
                      />
                      &nbsp;&nbsp;&nbsp;
                      <div className="d-flex flex-row align-items-center">
                        <label className="fw-bold" htmlFor="paymentStatus">
                          Lọc:&nbsp;
                        </label>
                        <select
                          className="form-control"
                          value={selectedRole}
                          onChange={handleRoleChange}
                          style={{ padding: "0.375rem 0.75rem", width: "auto" }}
                        >
                          <option value=""></option>
                          <option value="unpaid">Chưa thanh toán</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="error">Lỗi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-inline-block">Danh sách các thanh toán</h5>

              {isLoading ? (
                <div class="spinner-border text-primary ml-5" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Thời gian</th>
                    <th scope="col">Tổng số tiền</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thời gian thanh toán</th>
                    <th scope="col">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRole === ""
                    ? data.map((item, index) => (
                        <TeacherRow
                          key={index}
                          index={index}
                          item={item}
                          handleDetail={handleDetail}
                          handleError={handleError}
                        />
                      ))
                    : selectedRole === "unpaid" // Hiển thị danh sách giáo viên chưa thanh toán
                    ? dataUnpaid.map((item, index) => (
                        <TeacherRow
                          key={index}
                          index={index}
                          item={item}
                          handleDetail={handleDetail}
                          handleError={handleError}
                        />
                      ))
                    : selectedRole === "paid" // Hiển thị danh sách giáo viên chưa thanh toán
                    ? dataPaid.map((item, index) => (
                        <TeacherRow
                          key={index}
                          index={index}
                          item={item}
                          handleDetail={handleDetail}
                          handleError={handleError}
                        />
                      ))
                    : selectedRole === "error" // Hiển thị danh sách giáo viên chưa thanh toán
                    ? dataError.map((item, index) => (
                        <TeacherRow
                          key={index}
                          index={index}
                          item={item}
                          handleDetail={handleDetail}
                          handleError={handleError}
                        />
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-flex justify-content-end align-items-end">
            <button
              onClick={() => handleNavigate("/user/feedback")}
              className="btn btn-sm btn-primary"
            >
              Báo cáo
            </button>
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
                      {/* Giảng viên: {selectedTeacher ? selectedTeacher.fullname : ""} */}
                    </p>
                    {/* <p>Email: {selectedTeacher ? selectedTeacher.email : ""}</p> */}
                    <p>
                      {/* Số điện thoại: {selectedTeacher ? selectedTeacher.phone : ""} */}
                    </p>
                  </div>
                  {/* {selectedPrice && selectedCommission && !isNaN(selectedPrice) && !isNaN(selectedCommission) && (
                  <div className="mx-5">
                  <p>
                    Doanh thu: {selectedPrice/selectedCommission*100} đ
                  </p>
                  <p>Chi phí hoa hồng: {selectedPrice} đ</p>
                  <p>Lợi nhuận: {selectedPrice/selectedCommission*100 - selectedPrice}</p>
                  </div>
                )} */}
                </div>
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                  <h7 className="mb-0 d-inline-block">
                    Danh sách các khóa học
                  </h7>
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
    </div>
  );
}
