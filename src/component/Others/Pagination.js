import React, { useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import "./Pagination.css";

export default function Pagination({ pageCount, handlePageClick }) {
  const paginationRef = useRef(null);

  useEffect(() => {
    try {
      const pages = paginationRef.current.querySelectorAll(".pagination a");
      console.log(pages);
      pages.forEach((page, index) => {
        page.addEventListener("click", function () {
          try {
              let currentIndex; // Biến để lưu trữ chỉ số của phần tử đang hoạt động
              // Lặp qua tất cả các phần tử trong pages
              pages.forEach((page, index2) => {
                if (index2 === 0 || index2 === pages.length - 1) {
                  // Kiểm tra nếu là phần tử đầu tiên hoặc cuối cùng
                  page.classList.remove("active"); // Loại bỏ lớp "active"
                } else if (page.classList.contains("active")) {
                  // Kiểm tra nếu là phần tử đang hoạt động
                  currentIndex = index2; // Lưu trữ chỉ số của phần tử đang hoạt động
                }
              });
              console.log("current index: ", currentIndex);
            if (index > 0 && index < pages.length - 1) {
              // Nếu index không phải là đầu hoặc cuối
              pages.forEach((p) => {
                p.classList.remove("active");
              });
              this.classList.add("active"); // Thêm active chỉ khi không phải là previous hoặc next
            } else if (index === 0) {              
              const previousIndex = currentIndex - 1;
              if (
                currentIndex > 0 &&
                pages[previousIndex] &&
                previousIndex > 0
              ) {
                pages[previousIndex].classList.add("active");
                pages[currentIndex].classList.remove("active");
              }
            } else if (index === pages.length - 1) {
              
              const nextIndex = currentIndex + 1;
              if (
                currentIndex < pages.length - 1 &&
                pages[nextIndex] &&
                nextIndex !== pages.length - 1
              ) {
                pages[nextIndex].classList.add("active");
                pages[currentIndex].classList.remove("active");
              }
            }
          } catch (error) {
            console.error("Error in click event:", error);
          }
        });
      });

      pages.forEach((page, index) => {
        if (index === 1) {
          // Node thứ hai (index = 1)
          page.classList.add("active");
        } else if (index === 0 || index === pages.length - 1) {
          // Phần tử cuối cùng và phần tử đã được chọn
          page.classList.remove("active"); // Loại bỏ lớp "active"
        }
      });
      const pages2 = paginationRef.current.querySelectorAll(".pagination a");
      console.log("pages 2: ", pages);
    } catch (error) {}
  }, [pageCount]);

  return (
    <div className="pagination-container page" ref={paginationRef}>
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}
      />
    </div>
  );
}
