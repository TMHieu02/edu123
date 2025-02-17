import React, { useEffect, useState, useRef } from "react";

import { Link, useParams, useNavigate } from "react-router-dom";

import axiosClient from "../../../api/axiosClient.js";
import Header from "../Header/Header.js";
import Footer from "../Footer/Footer.js";

import CourseCard from "../Home/CourseCard.js";
import Pagination from "../../Others/PaginationNew.js";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faStar, faList, faCaretRight } from "@fortawesome/free-solid-svg-icons";


export default function Category() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchCourses, setSearchCourses] = useState([]);
  const [selectedOption, setSelectedOption] = useState("learn-most");
  const [filterOption, setFilterOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null); // Total pages received from API
  const [totalResult, setTotalResult] = useState(0);

  const [categoryName, setCategoryName] = useState('');
  const getCategoryName = async () => {
    try {
      const response = await axiosClient.get(
        `/categories/${categoryId}`
      );
      setCategoryName(response.data.name);
    } catch (error) {
      console.error("Error fetching search courses:", error);
    }
  }

  useEffect(() => {
    const fetchSearchCourses = async () => {
      try {
        // const response = await axiosClient.get(
        //   `/courses/search/${title}?&sort=${selectedOption}${filterOption}&pageNumber=${currentPage}&pageSize=6`
        // );

        // dùng cái này để kiểm tra một số chức năng chờ api phía trên sửa xong
        const response = await axiosClient.get(
          `/courses/filter-courses?categoryId=${categoryId}&sort=${selectedOption}${filterOption}&page=${currentPage}&size=6`
        );
        const filteredCourses = response.data.content.filter(
          (course) => course.isDeleted !== true && course.active === true
        );
        setSearchCourses(filteredCourses);
        console.log("total pages: ", response.data.totalPages);
        setTotalPages(response.data.totalPages);
        setTotalResult(response.data.totalElements);
      } catch (error) {
        console.error("Error fetching search courses:", error);
      }
    };

    if (categoryId) {
      fetchSearchCourses();
      getCategoryName();
    }
  }, [categoryId, selectedOption, filterOption, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [dropdownTitle, setDropdownTitle] = useState("Giá");

  //filter
  const [isPromotion, setIsPromotion] = useState(false);
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const updateFilter = (setFilterState, index) => {
    setFilterState((prevFilter) => {
      const newFilter = { ...prevFilter };

      // Tắt tất cả các đánh giá trước đó
      Object.keys(newFilter).forEach((key) => {
        newFilter[key] = false;
      });

      // Bật đánh giá được chọn
      newFilter[index] = !prevFilter[index];

      return newFilter;
    });
  };
  const [isPriceChange, setIsPriceChange] = useState(null);

  useEffect(() => {
    getFilter();
  }, [isPromotion, ratingFilter, isPriceChange]);
  const getFilter = () => {
    let anyFilterApplied = false;

    let filterString = "";



    if (minPriceFilter && !maxPriceFilter) {
      anyFilterApplied = true;
      filterString += "&minPromotionalPrice=" + minPriceFilter;
      console.log("ko có button được chọn + có giá trị của min");
    } else if (maxPriceFilter && !minPriceFilter) {
      anyFilterApplied = true;
      filterString += "&maxPromotionalPrice=" + maxPriceFilter;
      console.log("ko có button được chọn + có giá trị của max");
    } else if (minPriceFilter && maxPriceFilter) {
      anyFilterApplied = true;
      filterString +=
        "&minPromotionalPrice=" +
        minPriceFilter +
        "&maxPromotionalPrice=" +
        maxPriceFilter;
      console.log("ko có button được chọn + có giá trị của min và max");
    }


    for (let key in ratingFilter) {
      if (ratingFilter[key] === true) {
        anyFilterApplied = true;
        console.log("filter rating", key);
        filterString += "&minRating=" + key;
        break;
      }
    }

    if (isPromotion) {
      console.log("filter promotion");
      anyFilterApplied = true;
      filterString += "&hasPromotion=true";
    }

    if (anyFilterApplied) {
      setFilterOption(filterString);
      console.log("filter string", filterString);
    } else {
      setFilterOption(filterString);
      console.log("không có bộ lọc nào được chọn!");
    }
  };

  const resetFilter = () => {
    //xóa các thiết lập hiện có

    //khuyến mãi
    setIsPromotion(false);
    //khoảng giá input
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setIsPriceChange('');
    // rating
    setRatingFilter(prevFilter => {
      const newFilter = { ...prevFilter };

      // Tắt tất cả các đánh giá trước đó
      Object.keys(newFilter).forEach(key => {
        newFilter[key] = false;
      });

      return newFilter;
    });

  }


  return (
    <div>
      <Header />
      <div className="container-fluid col-md-10">
        <p className="fw-bold fs-3 mb-4">{totalResult} khóa học về "{categoryName}"</p>
        <div className="w-full row content-center">
          <div className="col-3">
            {/* 3 phần */}
            {/* Nội dung ở bên trái */}
            <p className="fs-5 fw-bold mb-1">
              <FontAwesomeIcon icon={faList} />
              &nbsp; Tất cả danh mục
            </p>
            <div className="ml-2 mb-1">
              <button className="btn p-0 m-0" onClick={() => navigate("/searchCategory/11")}>
                <p className={` ${categoryId == 11 ? "fw-bold text-primary" : ""
                  }`}>{categoryId == 11 ? (<><FontAwesomeIcon icon={faCaretRight} color="blue" />&nbsp;</>) : (<span>&nbsp;&nbsp;&nbsp;</span>)}Ngoại ngữ</p>
              </button>  <br />
              <button className="btn p-0 m-0" onClick={() => navigate("/searchCategory/14")}>
                <p className={` ${categoryId == 14 ? "fw-bold text-primary" : ""
                  }`}>{categoryId == 14 ? (<><FontAwesomeIcon icon={faCaretRight} color="blue" />&nbsp;</>) : (<span>&nbsp;&nbsp;&nbsp;</span>)}Marketing</p>
              </button>
              <br />
              <button className="btn p-0 m-0" onClick={() => navigate("/searchCategory/24")}>
                <p className={` ${categoryId == 24 ? "fw-bold text-primary" : ""
                  }`}>{categoryId == 24 ? (<><FontAwesomeIcon icon={faCaretRight} color="blue" />&nbsp;</>) : (<span>&nbsp;&nbsp;&nbsp;</span>)}Tin học văn phòng</p>
              </button>
              <br />
              <button className="btn p-0 m-0" onClick={() => navigate("/searchCategory/25")}>
                <p className={` ${categoryId == 25 ? "fw-bold text-primary" : ""
                  }`}>{categoryId == 25 ? (<><FontAwesomeIcon icon={faCaretRight} color="blue" />&nbsp;</>) : (<span>&nbsp;&nbsp;&nbsp;</span>)}Thiết kế</p>
              </button>
              <br />
              <button className="btn p-0 m-0" onClick={() => navigate("/searchCategory/26")}>
                <p className={` ${categoryId == 26 ? "fw-bold text-primary" : ""
                  }`}>{categoryId == 26 ? (<><FontAwesomeIcon icon={faCaretRight} color="blue" />&nbsp;</>) : (<span>&nbsp;&nbsp;&nbsp;</span>)}Phát triển bản thân</p>
              </button>
              <button className="btn p-0 m-0" onClick={() => navigate("/searchCategory/12")}>
                <p className={` ${categoryId == 12 ? "fw-bold text-primary" : ""
                  }`} > {categoryId == 12 ? (<><FontAwesomeIcon icon={faCaretRight} color="blue" />&nbsp;</>) : (<span>&nbsp;&nbsp;&nbsp;</span>)}Công nghệ thông tin</p>
              </button>
            </div>
            <p className="fs-5 fw-bold mb-3">
              <FontAwesomeIcon icon={faFilter} />
              &nbsp; Bộ lọc tìm kiếm
            </p>
            <p>Khoảng giá (đ) </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                style={{
                  borderRadius: "0.25rem",
                  backgroundColor: "#f3f4f6", // Màu xám nhạt
                  padding: "0.3rem", // Khoảng cách lề bên trong
                  width: "25%", // Độ rộng 25%
                  boxSizing: "border-box", // Tính cả border và padding vào kích thước
                }}
                value={minPriceFilter}
                onChange={(e) => setMinPriceFilter(e.target.value)}
                placeholder="Tối thiểu"
              />
              <p className="inline-block mx-2">&nbsp;-&nbsp;</p>
              <input
                style={{
                  borderRadius: "0.25rem",
                  backgroundColor: "#f3f4f6", // Màu xám nhạt
                  padding: "0.3rem", // Khoảng cách lề bên trong
                  width: "25%", // Độ rộng 25%
                  boxSizing: "border-box", // Tính cả border và padding vào kích thước
                }}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                placeholder="Tối đa"
              />
            </div>

            <button
              className="btn btn-primary px-lg-4 mt-2" // Thêm padding ngang (px-4)
              onClick={() => setIsPriceChange(minPriceFilter + maxPriceFilter)}
            >
              {" "}
              Áp dụng{" "}
            </button>

            <hr className="mt-3 mb-3 col-8" />
            <p>Đánh giá</p>
            <button
              className={`btn ${ratingFilter[5] === true ? "btn-success" : "btn-light"
                }`}
              onClick={() => updateFilter(setRatingFilter, 5)}
            >
              ⭐⭐⭐⭐⭐&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </button>
            <button
              className={`btn ${ratingFilter[4] === true ? "btn-success" : "btn-light"
                }`}
              onClick={() => updateFilter(setRatingFilter, 4)}
            >
              ⭐⭐⭐⭐
              <FontAwesomeIcon icon={faStar} color="white" /> &nbsp;
              <span className="small">trở lên</span>
            </button>
            <button
              className={`btn ${ratingFilter[3] === true ? "btn-success" : "btn-light"
                }`}
              onClick={() => updateFilter(setRatingFilter, 3)}
            >
              ⭐⭐⭐
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;
              <FontAwesomeIcon icon={faStar} color="white" /> &nbsp;
              <span className="small">trở lên</span>
            </button>
            <button
              className={`btn ${ratingFilter[2] === true ? "btn-success" : "btn-light"
                }`}
              onClick={() => updateFilter(setRatingFilter, 2)}
            >
              ⭐⭐
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;&nbsp;<span className="small">trở lên</span>
            </button>{" "}
            <br />
            <button
              className={`btn ${ratingFilter[1] === true ? "btn-success" : "btn-light"
                }`}
              onClick={() => updateFilter(setRatingFilter, 1)}
            >
              ⭐<FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;
              <FontAwesomeIcon icon={faStar} color="white" />
              &nbsp;&nbsp;<span className="small">trở lên</span>
            </button>
            <hr className="mt-3 mb-3 col-8" />
            <p>Khuyển mãi</p>
            <div className="">
              <input
                type="checkbox"
                className="d-inline-block"
                checked={isPromotion}
                style={{ transform: "scale(1.5)" }}
                onChange={(e) => {
                  setIsPromotion(!isPromotion);
                }}
              />
              <p className="d-inline-block small m-2">Đang giảm giá</p>
            </div>

            <hr className="mt-3 mb-3 col-8" />
            <button className="btn btn-danger pr-14 pl-14" onClick={() => resetFilter()}>
              {" "}
              Thiết lập lại{" "}
            </button>
          </div>
          <div className="col-9">
            {/* panel sort */}
            <div class="card p-0">
              <div
                class="card-body d-flex align-items-center p-0"
                style={{ backgroundColor: "rgb(237, 237, 237)" }}
              >
                <p className="mr-4 mt-3 " style={{ paddingLeft: 5 }}>Sắp xếp theo: </p>
                <button
                  onClick={() => setSelectedOption("learn-most")}
                  className={`btn ${selectedOption === "learn-most"
                    ? "btn-success"
                    : "btn-light"
                    }  mx-2 `}
                >
                  Bán chạy
                </button>
                <button
                  onClick={() => setSelectedOption("new")}
                  className={`btn ${selectedOption === "new" ? "btn-success" : "btn-light"
                    }  mx-2 `}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSelectedOption("rating")}
                  className={`btn ${selectedOption === "rating" ? "btn-success" : "btn-light"
                    }  mx-2`}
                >
                  Đánh giá cao
                </button>
                <Dropdown className="mx-2">
                  <Dropdown.Toggle
                    variant={
                      selectedOption === "price-high" ||
                        selectedOption === "price-low"
                        ? "success"
                        : "light"
                    }
                    id="dropdown-basic"
                  >
                    {dropdownTitle}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedOption("price-low");
                        setDropdownTitle("Giá: Thấp đến Cao");
                      }}
                    >
                      Giá: Thấp đến Cao
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedOption("price-high");
                        setDropdownTitle("Giá: Cao đến Thấp");
                      }}
                    >
                      Giá: Cao đến Thấp
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            {/* 7 phần, không cần offset nữa vì hai div nằm cùng một hàng */}
            {/* Nội dung ở bên phải */}
            <div className="row pt-1">
              {searchCourses.map((course) => (
                <div className="card mx-1 py-2 my-2" style={{ width: '30%' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CourseCard key={course.Id} course={course} />
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
