import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "../../../api/axiosClient";

const StarRating = ({ onRatingChange, courseId }) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchExistingRating = async () => {
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);

      try {
        const response = await axiosClient.get(
          `/ratings/user=${userId}/course=${courseId}`
        );
        const existingRating = response.data[0]?.rating || 0;
        console.log("Existing Rating: ", existingRating);
        setRating(existingRating);
      } catch (error) {
        console.error("Error fetching existing rating:", error);
      }
    };

    
    fetchExistingRating();
  }, [courseId]);

  const handleStarClick = async (selectedRating) => {
    setRating(selectedRating);
    onRatingChange(selectedRating);

    const encodedUserId = localStorage.getItem("userId");
    const userId = parseInt(atob(encodedUserId), 10);

    const ratingData = {
      courseId: courseId,
      userId: userId,
      rating: selectedRating,
    };

    try {
      const courseIdInt = parseInt(courseId, 10);
      const response = await axiosClient.get(
        `/ratings/user=${userId}/course=${courseIdInt}`
      );

      const ratingid = response.data[0]?.id || 0;
   

      if (response.data.length > 0) {
        await axiosClient.patch(`/ratings/${ratingid}`, {
          rating: selectedRating,
        });
        await axiosClient.post(`/courses/updateRating/${courseId}`);
        console.log("Rating updated successfully");
      } else {
        await axiosClient.post("/ratings", ratingData);
        console.log("Rating created successfully");
        await axiosClient.post(`/courses/updateRating/${courseId}`);
        
      }
    } catch (error) {
      console.error("Error handling existing rating:", error);
    }
  };

  return (
    <div>
      <p>Đánh giá của bạn</p>
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={faStar}
          className={star <= rating ? "star-filled" : "star-empty"}
          style={{ color: star <= rating ? "#ffd700" : "black" }}
          onClick={() => handleStarClick(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;