import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header.js";
import Footer from "../Footer/Footer.js";
import HomePageContent from "./HomePageContent";
import slideshow1 from "../../../assets/images/slideshow_1.jpg";
import slideshow2 from "../../../assets/images/slideshow_2.jpg";
import slideshow3 from "../../../assets/images/slideshow_3.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLanguage,
  faLineChart,
  faDesktop,
  faLightbulb,
  faCode,
  faPencilRuler,
} from "@fortawesome/free-solid-svg-icons";
import "./Home.css";

function HomePage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    window.open(path, "_blank");
  };
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % 3;
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeIndex]);

  useEffect(() => {
    checkUpdatePaymentInfo();
  }, []);

  //modal
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const checkUpdatePaymentInfo = async () => {
    try {
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      if (!isNaN(userId)) {
        console.log("userID: ", userId);
        const response = await axiosClient.get(`users/${userId}`);
        const userData = response.data;
        console.log("");
        if (userData.roleId === 2) {
          console.log("giang vien");
          if (userData.bank_name === null) {
            console.log("show modal");
            handleShowModal();
          }
        }
      }
    } catch (error) {}
  };

  return (
    <div>
      <Header />
      <div className="categories-col body">
        <div className=" col-sm-3">
          <nav>
            <ul>
              <li className="dropdown">
                <a href="/searchCategory/11">
                  <FontAwesomeIcon icon={faLanguage}></FontAwesomeIcon>
                  &nbsp;Ngoại ngữ
                </a>
              </li>
              <li className="dropdown">
                <a href="/searchCategory/14">
                  <FontAwesomeIcon icon={faLineChart}></FontAwesomeIcon>
                  &nbsp;Marketing
                </a>
              </li>
              <li className="dropdown">
                <a href="/searchCategory/24">
                  <FontAwesomeIcon icon={faDesktop}></FontAwesomeIcon>&nbsp;Tin
                  học văn phòng
                </a>
              </li>
              <li className="dropdown">
                <a href="/searchCategory/25">
                  <FontAwesomeIcon icon={faPencilRuler}></FontAwesomeIcon>
                  &nbsp;Thiết kế
                </a>
              </li>
              <li className="dropdown">
                <a href="/searchCategory/26">
                  <FontAwesomeIcon icon={faLightbulb}></FontAwesomeIcon>
                  &nbsp;Phát triển bản thân
                </a>
              </li>
              <li className="dropdown">
                <a href="/searchCategory/12">
                  <FontAwesomeIcon icon={faCode}></FontAwesomeIcon>&nbsp;Công
                  nghệ thông tin
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div
        id="demo"
        className="carousel slide col-sm-6 slideshow_homepage carousel-fade"
        data-bs-ride="carousel"
      >
        <div className="carousel-indicators">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#demo"
              data-bs-slide-to={index}
              className={activeIndex === index ? "active" : ""}
            ></button>
          ))}
        </div>

        <div className="carousel-inner">
          {[slideshow1, slideshow2, slideshow3].map((image, index) => (
            <div
              key={index}
              className={`carousel-item ${
                activeIndex === index ? "active" : ""
              }`}
            >
              <img
                src={image}
                alt={`Slideshow ${index + 1}`}
                className="d-block w-100 image-slideshow"
              />
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#demo"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#demo"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
        </button>
      </div>

      <HomePageContent />
      <div
        className="modal"
        tabIndex="-1"
        style={{ display: showModal ? "block" : "none" }}
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
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body p-10">
              <div>
                <p>
                  Chúc mừng bạn đã trở thành giảng viên. Vui lòng cập nhật thông
                  tin thanh toán!
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleCloseModal();
                  handleNavigate("/teacher/payment-info");
                }}
              >Cập nhật thông tin</button>              
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
