import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

const formatPrice = (price) => {
  if (typeof price !== "string") {
    price = String(price);
  }
  if (price == "0") {
    return "0 đồng";
  }

  if (price.startsWith("0")) {
    price = price.slice(1);
  }

  return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const encodedUserId = localStorage.getItem("userId");
        const decodedUserId = parseInt(atob(encodedUserId), 10);

        const response = await axiosClient.get("/courseRegisters");
        const courseRegisters = response.data;

        const isCourseRegistered = courseRegisters.some((register) => {
          const userIdMatch = register.userId === decodedUserId;
          const courseIdMatch = register.courseId === course.Id;

          return userIdMatch && courseIdMatch;
        });

        setIsRegistered(isCourseRegistered);
      } catch (error) {
        console.error("Error checking course registration:", error.message);
      }
    };

    checkRegistration();
  }, [course.Id]);

  const handleButtonClick = () => {
    if (isRegistered) {
      navigate(`/user/course/study/${course.Id}`);
    } else {
      handleAddToCart();
    }
  };

  const handleClick = () => {
    navigate(`/user/course/${course.Id}`);
  };

  const handleAddToCart = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const decodedUserId = atob(encodedUserId);

      const response = await axiosClient.post("/carts/create", {
        user_id: decodedUserId,
        course_id: course.Id,
      });

      console.log("Course added to cart:", response.data);
      const confirmed = window.confirm(
        "Đã thêm khóa học và giỏ hàng. Bạn có muốn chuyển đến giỏ hàng không?"
      );

      if (confirmed) {
        setTimeout(() => {
          navigate("/user/cart");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding course to cart:", error.message);
      window.alert(
        "Khóa học đã được thêm vào giỏ hàng hoặc đã bạn đã mua"
      );
    }
  };

  const formattedPrice = formatPrice(course.price);
  const formattedPromotionalPrice = formatPrice(course.promotional_price);

  return (
    <div
      className="card d-inline-block p-2 pt-3 mx-3"
      style={{ width: "18rem" }}
    >
      <img
        className="card-img-top"
        alt="..."
        src={course.image}
        onClick={handleClick}
      />
      <div className="card-body">
        <h5 className="card-title">{course.title}</h5>
        <p className="card-text">
          <p className="text-decoration-line-through">{formattedPrice} đ</p>
          <p className="card-text fw-bold">{formattedPromotionalPrice} đ</p>
        </p>
        <div className="d-inline-block">
          <span className="pt-2">
            {[...Array(course.rating)].map((_, index) => (
              <FontAwesomeIcon key={index} icon={faStar}></FontAwesomeIcon>
            ))}
          </span>
        </div>
        <button
          className={`btn ${
            isRegistered ? "btn-success" : "btn-primary"
          } w-100`}
          onClick={handleButtonClick}
        >
          {isRegistered ? "Vào học" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
