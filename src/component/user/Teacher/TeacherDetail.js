import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import axiosClient from "../../../api/axiosClient";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../Others/LoadingSpinner";
import CourseCard from "../Home/CourseCard";



const TeacherDetail = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [teacherField, setTeacherField] = useState("");
  const [teacherExperience, setTeacherExperience] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [isExpandedTeacher, setIsExpandedTeacher] = useState(false);
  const containerRefTeacher = useRef(null);
  const { id } = useParams();
  const [teacherProperities, setTeacherProperities] = useState([]);
  const [courseData, setCourseData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher data
        const [teacherResponse, courseCountResponse] = await Promise.all([
          axiosClient.get(`/users/${id}`),
          axiosClient.get(`courses/countByUsers/${id}`),
        ]);
        const teacherProperitiesResponse = await axiosClient.get(
          `/courseRegisters/teacher/${id}`
        );
        console.log("teacherProperities: ", teacherProperitiesResponse.data);
        setTeacherProperities(teacherProperitiesResponse.data);
        const descriptionParts = teacherResponse.data.description.split("**");
        const part1 = descriptionParts[0]; // Giảng viên
        const part2 = descriptionParts[1]; // Công nghệ thông tin
        setTeacherField(part2);

        const part3 = "Kinh nghiệm " + descriptionParts[2]; // 5 năm trên youtube
        setTeacherExperience(part3);
        setTeacherData(teacherResponse.data);
        setCourseCount(courseCountResponse.data);

        // course data
        const courseResponse = await axiosClient.get(`/courses/user=${id}`);
        const filteredCourseData = courseResponse.data.filter(
          (course) => !course.isDeleted
        );
        setCourseData(filteredCourseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleExpandTeacher = () => {
    setIsExpandedTeacher(!isExpandedTeacher);
    if (!isExpandedTeacher && containerRefTeacher.current) {
      containerRefTeacher.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!teacherData) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Header />
      <div className="container-fluid  col-md-8 d-flex flex-row">
        <div className="col-9 ">
          <p className="fs-5 py-0 my-0 text-muted fw-bold">Giảng viên</p>
          <p className="fs-3 py-0 my-0 fw-bold">{teacherData.fullname}</p>
          <p className="fs-6 py-0 my-0 fw-bold">
            {teacherField} - {teacherExperience}
          </p>
          <div className="pt-2 mt-2 d-flex flex-row">
            {teacherProperities && teacherProperities.length > 0 && (
              <>
                <div className="">
                  <p className="py-0 my-0 text-muted fw-bold small">
                    Tổng học viên
                  </p>
                  <p className="py-0 my-0 fw-bold fs-5">
                    {teacherProperities[0]?.totalStudent}
                  </p>
                </div>
                <div className="mx-3 px-3">
                  <p className="py-0 my-0 text-muted fw-bold small">Đánh giá</p>
                  <p className="py-0 my-0 fw-bold fs-5">
                    {teacherProperities[0]?.totalRating}
                  </p>
                </div>
              </>
            )}
          </div>
          <p className="fs-5 py-2 my-2 fw-bold">Giới thiệu về tôi</p>
          {/* {isExpandedTeacher ? ( */}
            <p className=" py-0 my-0 ">{teacherData.introduce}</p>
          {/* ) : (
            teacherData.introduce && (
              <p className=" py-0 my-0 ">
                {teacherData.introduce.slice(0, 500)}...
              </p>
            )
          )} */}
          {/* {!isExpandedTeacher ? (
            <button onClick={handleToggleExpandTeacher} className="btn">
              <p
                className="py-0 my-0"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Xem thêm
              </p>
            </button>
          ) : (
            <button onClick={handleToggleExpandTeacher} className="btn">
              <p
                className="py-0 my-0"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Thu gọn
              </p>
            </button>
          )} */}
          <p className="fs-5 py-2 my-2 fw-bold">
            Các khóa học của tôi (
            {teacherProperities &&
              teacherProperities.length > 0 &&
              teacherProperities[0]?.totalCourse}
            )
          </p>
          {/* danh sách các khóa học */}
          <div className="row justify-content-between " style={{paddingRight: 10}}>
            {courseData.map((course) => (      
              <div className="card mx-1 py-2" style={{ width: '45%' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CourseCard key={course.Id} course={course} />              
              </div>
            </div>
                   
            ))}
          </div>
        </div>
        <div className="col-3 d-flex justify-content-start">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "150px",
              height: "150px",
            }}
          >
            <img
              src={
                teacherData.avatar ||
                "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
              }
              className="img-thumbnail"
              alt="avatar"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeacherDetail;
