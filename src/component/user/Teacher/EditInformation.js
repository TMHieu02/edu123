import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axiosClient from "../../../api/axiosClient";

export default function EditInformation() {
 
  const [title, setTitle] = useState("");
  const [teachingSubject, setTeachingSubject] = useState("");
  const [teachingExperience, setTeachingExperience] = useState("");
  const [introduce, setIntroduce] = useState('');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        const encodedId = localStorage.getItem("userId");
        const userId = atob(encodedId);

        const response = await axiosClient.get(`users/${userId}`);
        const userData = response.data;

        const description = userData.description;

        const parts = description.split("**");

        const part1 = parts[0];
        const part2 = parts[1];
        const part3 = parts[2];
        setIntroduce(userData?.introduce);
        setTitle(part1);
        setTeachingSubject(part2);
        setTeachingExperience(part3);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  const fieldsToUpdate = {
    description: `${title}**${teachingSubject}**${teachingExperience}`,
    introduce: introduce,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !teachingSubject || !teachingExperience) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setSuccess("");
      return;
    }

    try {
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);

      const response = await axiosClient.patch(
        `/users/${userId}`,
        fieldsToUpdate
      );

      setSuccess("Cập nhật thành công!");
      setError("");
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Cập nhật thất bại. Vui lòng thử lại.");
      setSuccess("");
    }
  };
  

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-9 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5  fw-bold ">
                  Chỉnh sửa thông tin giảng viên{" "}
                </h2>
                <form onSubmit={handleSubmit}>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  {success && <p style={{ color: "green" }}>{success}</p>}
                  <div className="form-outline mb-4">
                    <label className="form-label fw-bold" htmlFor="name">
                      Giới thiệu *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Giới thiệu"
                      name="introduce"
                      value={introduce}
                      onChange={(e) => setIntroduce(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label fw-bold" htmlFor="name">
                      Chức danh *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Chức danh"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label fw-bold" htmlFor="name">
                      Chủ đề muốn giảng dạy *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Chủ đề muốn giảng dạy trên edu123"
                      name="teachingSubject"
                      value={teachingSubject}
                      onChange={(e) => setTeachingSubject(e.target.value)}
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label fw-bold" htmlFor="name">
                      Kinh nghiệp giảng dạy *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Kinh nghiệp giảng dạy"
                      name="teachingExperience"
                      value={teachingExperience}
                      onChange={(e) => setTeachingExperience(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4 w-100 "
                  >
                    Cập nhật
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
