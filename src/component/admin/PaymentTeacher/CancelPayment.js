import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import "../User/manager-user.css";
import "../Notification/Notification.css";

export default function CancelPayment() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const getCurrentFormattedDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };
  const [dateStart, setDateStart] = useState(getCurrentFormattedDate());
  const [dateEnd, setDateEnd] = useState(getCurrentFormattedDate());
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const fetchTeachers = async () => {
    try {
      const response = await axiosClient.get("/users/allTeachers");
      setTeachers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

  const fetchCoursesByTeacherId = async (teacherId) => {
    try {
      const response = await axiosClient.get(
        `courses/payment/teacher=${teacherId}`
      );
      const coursesData = response.data;
      const coursePromises = coursesData.map((course) => {
        return axiosClient.get(`/courseRegisters/course=${course.courseId}`);
      });
      const courseResponses = await Promise.all(coursePromises);
      const mergedCourses = coursesData.map((course, index) => {
        return {
          ...course,
          courseDetails: courseResponses[index].data,
        };
      });
      setCourses(mergedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      setCourses([]);
      fetchCoursesByTeacherId(selectedTeacherId);
    }
  }, [selectedTeacherId]);

  const handleTeacherSelection = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setSelectedTeacher(teachers.find((teacher) => teacher.Id === teacherId));
  };

  const handleCourseSelection = (courseId) => {
    const index = selectedCourses.indexOf(courseId);
    if (index === -1) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      const updatedSelectedCourses = [...selectedCourses];
      updatedSelectedCourses.splice(index, 1);
      setSelectedCourses(updatedSelectedCourses);
    }
  };

  useEffect(() => {
    let total = 0;
    selectedCourses.forEach((selectedCourseId) => {
      courses.forEach((course) => {
        course.courseDetails.forEach((detail) => {
          if (detail.Id === selectedCourseId) {
            total += course.promotional_price;
          }
        });
      });
    });
    setTotalAmount(total);
  }, [selectedCourses, courses]);

  const reloadCourses = async () => {
    try {
      setIsLoading(true);
      await fetchCoursesByTeacherId(selectedTeacherId);
      setNotification({
        type: "success",
        message: "Đã cập nhật lại danh sách khóa học",
      });
    } catch (error) {
      console.error("Error reloading courses:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi khi cập nhật lại danh sách khóa học",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconciliation = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy đối soát không?"
    );
    if (confirmed) {
      try {
        setIsLoading(true);
        const selectedCoursesToReconcile = courses.flatMap((course) =>
          course.courseDetails.filter((detail) =>
            selectedCourses.includes(detail.Id)
          )
        );
        const promises = selectedCoursesToReconcile.map((course) =>
          axiosClient.patch(`/courseRegisters/${course.Id}`, {
            payment: 0,
            paymentDay: null,
          })
        );
        await Promise.all(promises);
        setNotification({
          type: "success",
          message: "Hủy Đối soát thành công",
        });
        reloadCourses(); // Tải lại danh sách khóa học sau khi đối soát thành công
      } catch (error) {
        console.error("Error reconciling courses:", error);
        setNotification({
          type: "error",
          message: "Đã xảy ra lỗi khi đối soát",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    if (selectedTeacher) {
      const commission = selectedTeacher.commission || 0;
      const amountToPay = Math.floor((totalAmount * commission) / 100);
      setPaymentAmount(amountToPay);
    }
  }, [totalAmount, selectedTeacher]);

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        <div className="row mb-4"></div>
        <div className="row mb-4">
          <div className="col">
            <h5 className="mb-0">Danh sách giảng viên</h5>
            <label htmlFor="dateStart">Từ ngày: </label>
            <input
              type="date"
              id="dateStart"
              name="dateStart"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <label htmlFor="dateEnd">Đến ngày: </label>
            <input
              type="date"
              id="dateEnd"
              name="dateEnd"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
            &nbsp;
            <p></p>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Id giảng viên</th>
                  <th scope="col">Họ và tên</th>
                  <th scope="col">Email</th>
                  <th scope="col">Số điện thoại</th>
                </tr>
              </thead>
              <tbody>
                {teachers
                  .sort((a, b) => a.Id - b.Id)
                  .map((teacher) => (
                    <tr
                      key={teacher.Id}
                      onClick={() => handleTeacherSelection(teacher.Id)}
                    >
                      <td>{teacher.Id}</td>
                      <td>{teacher.fullname}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.phone}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-inline-block">
              Danh sách các khóa học đã thanh toán
            </h5>
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
                <th scope="col">Id thanh toán</th>
                  <th scope="col">Khóa học</th>
                  <th scope="col">Giá</th>
                  <th scope="col">Ngày thanh toán</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Chọn</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <React.Fragment key={course.courseId}>
                    {course.courseDetails
                      .filter(
                        (detail) => detail.payment === 1 || detail.payment === 2
                      )
                      .filter((detail) => {
                          const paymentDay = new Date(detail.paymentDay);
                          const startDate = new Date(dateStart);
                          const endDatePlusOneDay = new Date(dateEnd);
                          endDatePlusOneDay.setDate(
                            endDatePlusOneDay.getDate() + 1
                          ); // Thêm một ngày vào ngày kết thúc
                          return (
                            paymentDay >= startDate &&
                            paymentDay <= endDatePlusOneDay
                          );
                        })
                      .sort(
                        (a, b) =>
                          new Date(a.paymentDay) - new Date(b.paymentDay)
                      )
                      .map((detail, index) => {
                        const paymentDay = new Date(detail.paymentDay);
                        let status;
                        if (detail.payment === 1) {
                          status = "Đã thanh toán";
                        } else if (detail.payment === 2) {
                          status = "Lỗi";
                        }
                        return (
                          <tr key={`${course.courseId}-${index}`}>
                          <td>{detail.Id}</td>
                            <td>{course.title}</td>
                            <td>
                              {course.promotional_price.toLocaleString("vi-VN")}
                            </td>
                            <td>{`${paymentDay.getDate()}/${
                              paymentDay.getMonth() + 1
                            }/${paymentDay.getFullYear()}`}</td>
                            <td>{status}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(detail.Id)}
                                onChange={() =>
                                  handleCourseSelection(detail.Id)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p>Giảng viên: {selectedTeacher ? selectedTeacher.fullname : ""}</p>
          <p>Email: {selectedTeacher ? selectedTeacher.email : ""}</p>
          <p>Số điện thoại: {selectedTeacher ? selectedTeacher.phone : ""}</p>
          <p>Tổng tiền: {totalAmount.toLocaleString()} VNĐ</p>
          <p>Hoa hồng: {selectedTeacher ? selectedTeacher.commission : ""}%</p>
          <p>Số tiền đã trả: {paymentAmount.toLocaleString()} VNĐ</p>
          <p>Ngân hàng: {selectedTeacher ? selectedTeacher.bank_name : ""}</p>
          <p>Số tài khoản: {selectedTeacher ? selectedTeacher.account_number : ""}</p>
          <p>Chủ tài khoản: {selectedTeacher ? selectedTeacher.account_name: ""}</p>

          <button
            onClick={handleReconciliation}
            disabled={!selectedCourses.length}
          >
            Hủy Đối soát
          </button>
        </div>
      </main>
    </div>
  );
}
