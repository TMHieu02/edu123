import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useParams } from "react-router-dom";
import CourseCard from "../Course/CourseCard";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchCourse = () => {
  const [searchCourses, setSearchCourses] = useState([]);
  const { title } = useParams();

  useEffect(() => {
    const fetchSearchCourses = async () => {
      try {
        // Check if search results are available in AsyncStorage
        const storedSearchCourses = await AsyncStorage.getItem('searchCourses');
        if (storedSearchCourses) {
          setSearchCourses(JSON.parse(storedSearchCourses));
        } else {
          // Fetch search courses from the server if not available in AsyncStorage
          const response = await axiosClient.get(`/courses/search/${title}`);
          setSearchCourses(response.data);

          // Update AsyncStorage with search results
          await AsyncStorage.setItem('searchCourses', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching search courses:", error);
      }
    };

    if (title) {
      fetchSearchCourses();
    }
  }, [title]);

  return (
    <div className="container-fluid col-md-10">
      <div className="row">
        <div className="center_body">
          <br />
          <h3 className="fw-bold">Kết quả tìm được</h3>
          <br />
          <div className="row">
            {searchCourses.map((course) => (
              <CourseCard key={course.Id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCourse;
