import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import "./upgrade-to-teacher.css";
import Header from "../Header/Header";

export default function ToTeacherDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [title, setTitle] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [teachingSubject, setTeachingSubject] = useState("");
  const [teachingExperience, setTeachingExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosClient.get(`/users/${id}`);
        setUser(response.data);
        console.log(response.data);
        setUserImage(response.data.avatar);
        console.log(response.data.avatar);
        const userData = response.data;

        const description = userData.description;

        const parts = description.split("**");

        const part1 = parts[0];
        const part2 = parts[1];
        const part3 = parts[2];
        setIntroduce(userData.introduce);
        setTitle(part1);
        setTeachingSubject(part2);
        setTeachingExperience(part3);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      const response = await axiosClient.patch(`/users/${user.Id}`, {
        roleId: 2,
        commission: 40.0,
      });
      console.log(response);

      const messageResponse = await axiosClient.post(
        `/auth/send/message/title/${user.email}`,
        {
          message: "Congratulations on becoming an instructor! Upload your course and start earning money now!",
          title: "EDU123 - CONGRATULATIONS ON BECOMING AN INSTRUCTOR"
        }
      );
      setIsLoading(false);
      console.log(messageResponse);

      setNotification({
        type: "success",
        message: "Đã cấp quyền cho người dùng thành giảng viên thành công",
      });
      setTimeout(() => {
        navigate("/admin/upgrade-to-teacher");
      }, 3000);
    } catch (error) {
      console.error("Error updating role or sending message:", error);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi vui lòng thử lại sau!",
      });
    }
  };

  const handleReject = () => {
    navigate(
      `/admin/upgrade-to-teacher/detail/reject/${user.email}/${user.Id}`
    );
  };

  if (!user) {
    return (
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        <div className="container">
          <div className="row">
            <div className="col-sm-9 col-md-7 col-lg-9 mx-auto">
              <div className="card border-0 shadow rounded-3 my-5">
                <div className="card-body p-4 p-sm-5">
                  <h2 className="card-title text-center mb-5  fw-bold ">
                    Thông tin người dùng{" "}
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        width: "250px",
                      }}
                    >
                      <img
                        src={userImage}
                        style={{
                          width: "100%", // Scale image to fit the container
                          height: "auto", // Keep the aspect ratio of the image
                        }}
                        alt="User Avatar"
                        className="card-img-top"
                      />
                    </div>
                    <br />
                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="name">
                        Giới thiệu
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Chủ đề muốn giảng dạy trên edu123"
                        value={introduce}
                        rows={6} 
                        readOnly
                      />
                    </div>    
                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="name">
                        Chức danh
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Chủ đề muốn giảng dạy trên edu123"
                        value={title}
                        readOnly
                      />
                    </div>

                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="name">
                        Lĩnh vực giảng dạy
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Chủ đề muốn giảng dạy trên edu123"
                        value={teachingSubject}
                        readOnly
                      />
                    </div>
                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="name">
                        Kinh nghiệm giảng dạy
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Chủ đề muốn giảng dạy trên edu123"
                        value={teachingExperience}
                        readOnly
                      />
                    </div>
                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="email">
                        Email{" "}
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          style={{
                            width: "250px",
                          }}
                          type="text"
                          className="form-control"
                          placeholder="Số điện thoại"
                          value={user.email}
                          readOnly
                        />                        
                      </div>
                    </div>

                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="name">
                        Số điện thoại{" "}
                      </label>
                      <div className="d-flex">
                        <input
                          style={{
                            width: "250px",
                          }}
                          type="text"
                          className="form-control"
                          placeholder="Số điện thoại"
                          value={user.phone}
                          readOnly
                        />
                        <div className="uti-link d-inline-block text-decoration-underline">
                          <a
                            href={`https://zalo.me/${user.phone}`}
                            className="btn btn-light"
                            role="button"
                            aria-disabled="true"
                            target="_blank"
                          >
                            Liên hệ qua zalo{" "}
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png"
                              alt="vnpay"
                              style={{
                                width: "35px",
                                height: "35px",
                                marginRight: "10px",
                              }}
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="name">
                        Họ và tên{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Họ và tên"
                        value={user.fullname}
                        readOnly
                      />
                    </div>
                    <div className="form-outline mb-4">
                      {isLoading ? (
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      {notification && (
                        <div className={`notification ${notification.type}`}>
                          {notification.message}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-block mb-4 w-50 "
                    >
                      Chấp nhận
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-block mb-4 w-50 "
                      onClick={handleReject}
                    >
                      Từ chối
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
