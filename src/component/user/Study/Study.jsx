import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import "./styles.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";


const Study = () => {
        //chuyển hướng trang 
        const navigate = useNavigate();

        const handleNavigate = (path, params) => {
                navigate(path, { state: params });
        };

        const [registeredCourses, setRegisteredCourses] = useState([]);
        const [userID, setUserID] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const loadDataCourse = async () => {
                try {
                        setIsLoading(true);
                        const encodedUserId = localStorage.getItem("userId");
                        const userID = parseInt(atob(encodedUserId), 10);
                        if (userID) {

                                setUserID(userID);
                                const response = await axiosClient.get(`/courseRegisters/user/${userID}`);
                                const filteredCourses = response.data.filter(
                                        course =>  course.deleted !== true && course.isDeleted !== true
                                );
                                setIsLoading(false);
                                setRegisteredCourses(filteredCourses);
                                console.log(filteredCourses);
                        } else {

                        }

                } catch (error) {
                        console.error("Error fetching registered courses:", error.message);
                        setIsLoading(false);
                }
        }

        useEffect(() => {
                loadDataCourse();
        }, []);

        const CourseItem = ({ course }) => {
                return (
                        <div className="card" style={{ width: '35vh' }} onClick={() => handleNavigate(`/user/course/study/${course.courseId}`)}>
                                <img  src={course.image} className="" alt={course.title} style={{ width: '17vw', height: '18vh', objectFit: 'fill' }} />
                                <div className="card-body">
                                        <h5  className="text-nowrap overflow-hidden text-truncate card-title">{course.title}</h5>
                                        <p  className="text-nowrap overflow-hidden text-truncate card-text">{course.name}</p>
                                        <div className="progress bg-gray-200 rounded-full" >
                                                <div className="progress-bar bg-blue-600" role="progressbar" style={{ width: `${course.progress}%` }} aria-valuenow={course.progress} aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                        <p className="text-sm">Hoàn thành: {course.progress}%</p>                                        
                                </div>
                        </div>

                );
        };
        return (
                <div>
                        <Header />
                        {/* nội dung */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="card mb-4" style={{ width: '75%' }}>
                                        <div className="card-header py-3" >
                                                <div style={{ justifyContent: 'end' }}>
                                                        <p style={{ fontWeight: 'bold', fontSize: '20px' }}>Học tập</p>
                                                </div>
                                        </div>
                                        {isLoading && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', }}>



                                                        <div class="spinner-border spinner-border-sm" role="status">
                                                                <span class="visually-hidden">Loading...</span>
                                                        </div>
                                                        <div class="spinner-grow spinner-grow-sm" role="status">
                                                                <span class="visually-hidden">Loading...</span>
                                                        </div>


                                                </div>
                                        )}
                                        <div className="container card-body">
                                                <div className="row">
                                                        {registeredCourses.map((course) => (
                                                                <div
                                                                        className="col-lg-3 col-md-4 col-sm-6 mb-4"
                                                                        key={course.courseId}
                                                                >
                                                                        <CourseItem course={course} />
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                </div>
                        </div>
                        <Footer />
                </div>
        );

}

export default Study;