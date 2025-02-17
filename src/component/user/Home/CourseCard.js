import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import "./CourseCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const formatPrice = (price) => {
  if (typeof price !== "string") {
    price = String(price);
  }

  if (price.startsWith("0")) {
    price = price.slice(1);
  }

  return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [couseCheck, setCourseCheck] = useState("");

  const checkCourse = async () => {
    try {
      setIsLoading(true);
      const encodedUserId = localStorage.getItem("userId");
      const userID = parseInt(atob(encodedUserId), 10);
      if (userID) {
        console.log(userID);
        const response = await axiosClient.get(
          "/courseRegisters/check/" + userID + "/" + course.course_id
        );
        console.log("response: " + response.data);
        if (response.data === true || response.data === "true") {
          console.log("Khóa học này đã được user đăng kí học!");
          setCourseCheck("register");
        } else {
          try {
            const response2 = await axiosClient.get(
              "/carts/check/" + userID + "/" + course.course_id
            );
            if (response2.data === true || response2.data === "true") {
              setCourseCheck("cart");
              console.log("Khóa học này đã được thêm vào giỏ hàng!");
            }
          } catch (error) {
            setIsLoading(false);
          }
        }
        console.log("course check: ", couseCheck);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCourse();
  }, [course.course_id]);

  //modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const handleShowConfirmModal = () => setShowConfirmModal(true);
  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  //modal login add to card
  const [showAlertModal, setShowAlertModal] = useState(false);
  const handleShowAlertModal = () => setShowAlertModal(true);
  const handleCloseAlertModal = () => setShowAlertModal(false);

  const handleAddToCart = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      if (!encodedUserId) {
        handleShowAlertModal();
        return;
      }
      const decodedUserId = atob(encodedUserId);
      console.log("decodedUserId", decodedUserId);
      console.log("course.Id", course.course_id);

      const response = await axiosClient.post("/carts/create", {
        userId: decodedUserId,
        courseId: course.course_id,
      });
      setCourseCheck("cart");
      console.log("Course added to cart:", response.data);
      handleShowConfirmModal();
    } catch (error) {
      console.error("Error adding course to cart:", error.message);
      window.alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng!");
    }
  };

  const formattedPrice = formatPrice(course.price);
  const formattedPromotionalPrice = formatPrice(course.promotional_price);
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // fomart thời gian
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.toLocaleString("default", { month: "numeric" });
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  // lợi ích của khóa học

  return (
    <div className=" pt-0 pr-0 mx-3 p-0 pe-0 mb-1" style={{ width: "15rem" }}>
      <div
        className="card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ border: "none", borderRadius: "0" }}
      >
        <Link
          to={`/user/course/${course.course_id}`}
          className="d-flex justify-content-center bg-white"
        >
          <div>
            <img
              className="card-img-top p-0 pe-0"
              alt="..."
              src={
                course.image ||
                "https://foundr.com/wp-content/uploads/2023/04/How-to-create-an-online-course.jpg.webp"
              }
              style={{ width: "100wh", height: "120px" }}
            />
          </div>
        </Link>

        {isHovered && (
          <div className="hovered-div">
            <p className="fw-bold ">{course.title}</p>
            <p className="pb-1 small">
              Lần cập nhật mới nhất :{" "}
              <span className="fw-bold">{formatDate(course.updateAt)}</span>
            </p>
            <p className="small">{course.description}</p>

            {isLoading ? (
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>
                {couseCheck === "register" && (
                  <button
                    className="btn btn-success w-100"
                    onClick={() =>
                      navigate(`/user/course/study/${course.course_id}`)
                    }
                  >
                    Vào học
                  </button>
                )}
                {couseCheck === "cart" && (
                  <button
                    className="btn btn-info w-100"
                    onClick={() => navigate("/user/cart")}
                  >
                    Chuyển đến giỏ hàng
                  </button>
                )}
                {couseCheck === "" && (
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleAddToCart}
                  >
                    Thêm vào giỏ hàng
                  </button>
                )}
              </>
            )}

            <div class="triangle-border"></div>
            <div class="triangle"></div>
          </div>
        )}
      </div>

      <div className="card-body p-1 pe-1">
        <p className="py-0 my-0 fw-bold fs-5">{course.title}</p>
        <div style={{ display: "block" }}>
          <div>
            <p
              className="card-instructor"
              style={{ padding: "0", margin: "0" }}
            >
              {course.user_name}
            </p>
            <div
              className="course-rating"
              style={{ padding: "0", margin: "0" }}
            >
              {"⭐".repeat(Math.floor(course.rating))}
              <span>({course.rating.toFixed(1)})</span>
            </div>
          </div>

          <div className="card-text" style={{ textAlign: "right" }}>
            {formattedPrice === formattedPromotionalPrice ? (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p
                  className="py-0 my-0"
                  style={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  {formattedPrice}
                </p>
                <p
                  className="py-0 my-0"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  đ
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <p
                    className="py-0 my-0"
                    style={{ fontSize: "1.25rem", fontWeight: "bold" }}
                  >
                    {formattedPromotionalPrice}
                  </p>
                  <p
                    className="py-0 my-0"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textDecoration: "underline",
                      paddingRight: 15,
                    }}
                  >
                    đ
                  </p>
                  <p
                    className="py-0 my-0"
                    style={{
                      color: "gray",
                      fontSize: "1.0rem",
                      textDecoration: "line-through",
                    }}
                  >
                    {formattedPrice}
                  </p>
                  <p
                    className="py-0 my-0"
                    style={{
                      color: "gray",
                      fontSize: "0.875rem",
                      textDecoration: "line-through",
                    }}
                  >
                    đ
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        className="modal"
        tabIndex="-1"
        style={{ display: showConfirmModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontWeight: "bold" }}>
                Đã thêm vào giỏ hàng
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseConfirmModal}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                  style={{
                    display: "flex",
                    alignContent: "center",
                    alignItems: "center",
                    paddingRight: 10,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    color="#19A38C"
                    size="2x"
                  />
                </div>
                <img
                  src={course.image}
                  alt="Avatar"
                  className="img-fluid"
                  style={{ width: "75px", height: "75px" }}
                />
                <div style={{ paddingLeft: 5 }}>
                  <p style={{ fontWeight: "550" }}>{course.title}</p>
                  <p style={{ color: "gray" }}>{course.description}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleCloseConfirmModal();
                  navigate("/user/cart");
                }}
              >
                Chuyển tới giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* alert modal */}
      <div
        className="modal"
        tabIndex="-1"
        style={{ display: showAlertModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontWeight: "bold" }}>
                Thông báo
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseAlertModal}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p className="">Bạn cần đăng nhập để thêm vào giỏ hàng</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  handleCloseAlertModal();
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default CourseCard;
