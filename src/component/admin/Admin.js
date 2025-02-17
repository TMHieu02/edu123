import Header from "./Header/Header";
import React, { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
function Admin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  const [totalSold, setTotalSold] = useState(0);
  const [soldDay, setSoldDay] = useState(0);
  const [soldDayNoActive, setSoldDayNoActive] = useState(0);
  const [soldMonth, setSoldMonth] = useState(0);

  const [totalPrice, setTotalPrice] = useState(0);
  const [priceDay, setPriceDay] = useState(0);
  const [priceMonth, setPriceMonth] = useState(0);
  const getCurrentFormattedDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };
  const [dateStart, setDateStart] = useState(getCurrentFormattedDate());
  const [dateEnd, setDateEnd] = useState(getCurrentFormattedDate());
  const [totalPriceInTime, setTotalPriceInTime] = useState(0);
  const [totalSoldInTime, setTotalSoldInTime] = useState(0);

  const formatPrice = (price) => {
    if (typeof price !== "string") {
      price = String(price);
    }
    if (price == "0") {
      return "0";
    }

    if (price.startsWith("0")) {
      price = price.slice(1);
    }

    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const handleNavigate = (path) => {
    window.open(path, "_blank");
   };
 

  useEffect(() => {
    async function fetchUserData() {
      try {
        const currentDate = new Date();
        const formattedDate = `${currentDate
          .getDate()
          .toString()
          .padStart(2, "0")}-${(currentDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${currentDate.getFullYear()}`;
        const formattedMonthYear = `${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${currentDate.getFullYear()}`;

        const [
          response,
          response_NoActive,
          response2,
          response_price_day,
          response_price_month,
          response_total_sold,
          response_total_price,
        ] = await Promise.all([
          axiosClient.get(
            `/courseRegisters/total-sold-in-day/${formattedDate}`
          ),
          axiosClient.get(
            `/courseRegisters/total-sold-in-day-no-active/${formattedDate}`
          ),
          axiosClient.get(
            `/courseRegisters/total-sold-in-month/${formattedMonthYear}`
          ),
          axiosClient.get(
            `/courseRegisters/total-price-in-day/${formattedDate}`
          ),
          axiosClient.get(
            `/courseRegisters/total-price-in-month/${formattedMonthYear}`
          ),
          axiosClient.get(`/courseRegisters/total-sold`),
          axiosClient.get(`/courseRegisters/total-price`),
        ]);

        setSoldDay(response.data);
        setSoldDayNoActive(response_NoActive.data);
        setSoldMonth(response2.data);
        setPriceDay(formatPrice(response_price_day.data));
        setPriceMonth(formatPrice(response_price_month.data));
        setTotalSold(response_total_sold.data);
        setTotalPrice(formatPrice(response_total_price.data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    getDataHandle();
    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  // Function to handle the filtering action
  const handleFilter = async () => {
    try {
      const formattedStart = formatDate(dateStart);
      const formattedEnd = formatDate(dateEnd);
      // Create the URL with the formatted dates
      setIsLoading(true);
      const price = await axiosClient.get(
        `/courseRegisters/total-price-in-time/${formattedStart}/${formattedEnd}`
      );
      setTotalPriceInTime(formatPrice(price.data));

      const sold = await axiosClient.get(
        `/courseRegisters/total-sold-in-time/${formattedStart}/${formattedEnd}`
      );
      setTotalSoldInTime(formatPrice(sold.data));
      setIsLoading(false);
      // Navigate to the new URL
    } catch (error) {
      console.error("Error formatting dates or navigating:", error);
    }
  };

  //statics 2
  const [titleStaticsChart2, setTitleStaticsChart2] = useState("");
  const lineChartOptions = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Biều Đồ Doanh Thu Hàng Tháng Trong " + titleStaticsChart2,
        color: "black",
        font: {
          family: "Comic Sans MS",
          size: 20,
          weight: "bold",
          lineHeight: 1.2,
        },
      },
    },
  };
  const [lineChartData, setLineChartData] = useState({
    labels: [1500, 1600, 1700, 1750, 1800, 1850, 1900, 1950, 1999, 2050],
    datasets: [
      {
        data: [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478],
        label: "Africa",
        borderColor: "#3e95cd",
        fill: false,
      },
      {
        data: [282, 350, 411, 502, 635, 809, 947, 1402, 3700, 5267],
        label: "Asia",
        borderColor: "#8e5ea2",
        fill: false,
      },
      {
        data: [168, 170, 178, 190, 203, 276, 408, 547, 675, 734],
        label: "Europe",
        borderColor: "#3cba9f",
        fill: false,
      },
      {
        data: [40, 20, 10, 16, 24, 38, 74, 167, 508, 784],
        label: "Latin America",
        borderColor: "#e8c3b9",
        fill: false,
      },
      {
        data: [6, 3, 2, 2, 7, 26, 82, 172, 312, 433],
        label: "North America",
        borderColor: "#c45850",
        fill: false,
      },
    ],
  });
  const [isLoadingChart2, setIsLoadingChart2] = useState(false);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Tăng tháng hiện tại lên 1
  const [selectedYear2, setSeletedYear2] = useState(`${currentYear}`);
  const [selectedMonth2, setSelectedMonth2] = useState(
    `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
  );
  const handleYearChange2 = (event) => {
    setSeletedYear2(event.target.value);
    setSelectedMonth2(event.target.value);
    setTitleStaticsChart2("Năm " + event.target.value);
    // nếu như chọn cái năm trùng với năm hiện tại
    if (event.target.value == currentYear) {
      console.log("trùng với với năm hiện tại!");
      setSelectedMonth2(
        `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
      );
    } else {
      console.log("ko trùng với với năm hiện tại!");
      setSelectedMonth2(`${event.target.value}-12`);
    }
  };

  const formatDateFunction = (dateString) => {
    const [day, month, year] = dateString
      .split("/")
      .map((item) => item.padStart(2, "0"));
    return `${month}-${year}`;
  };
  const generateTimeDisplay = (selectedMonth) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const months = [];
    console.log('hàm generatieTimeDisplay - tháng hiện tại: ', month);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    // Duyệt từ tháng 1 đến tháng đã chọn
    for (let m = 1; m <= month; m++) {
      const monthYear = new Date(year, m, 0);
      const monthYearFormatted = formatDateFunction(
        monthYear.toLocaleDateString('en-GB', options)
      );
      const monthData = {
        month: monthYearFormatted,
      };

      months.push(monthData);
    }
    console.log("month array: ", months);
    return months;
  };

  useEffect(() => {
    fetchDataStatics2();
  }, [selectedMonth2]);

  const fetchDataStatics2 = async () => {
    try {
      setIsLoadingChart2(true);
      setTitleStaticsChart2("Năm " + selectedYear2);

      const timeDisplay = generateTimeDisplay(selectedMonth2);
      console.log('time: ', timeDisplay);
      console.log('tháng: ', currentMonth);
      console.log('ngày: ', currentDate);
      console.log('selectedMonth2: ', selectedMonth2);
      const promises = timeDisplay.map(async (item) => {
        const response = await axiosClient.get(
          `/courseRegisters/total-price-in-month/${item.month}`
        );
        return {
          title: item.month,
          money: response.data,
        };
      });

      const coursesInfoArray = await Promise.all(promises);
      console.log("course info: ", coursesInfoArray);
      const labels = coursesInfoArray.map((item) => item.title);
      const moneyData = coursesInfoArray.map((item) => item.money);

      const newLineChartData = {
        labels: labels,
        datasets: [
          {
            label: "Tổng số tiền",
            borderColor: "#8e5ea2",
            fill: false,
            data: moneyData,
          },
        ],
      };

      setLineChartData(newLineChartData);
      setIsLoadingChart2(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoadingChart2(false);
    }
  };

  // lấy các thông tin cần xử lý
  const [handlePayment, setHandlePayment] = useState(0);
  const [handleApprovalCourse, setHandleApprovalCourse] = useState(0);
  const [handleApprovalUser, setHandleApprovalUser] = useState(0);
  const [handleFeedback, setHandleFeedback] = useState(0);
  const getDataHandle = async () => {
    try {
      setIsLoading(true);
      const responseHandleApprovalCourse = await axiosClient.get(
        `/courses/course-approval`
      );
      console.log("handleAppravalCourse: ", responseHandleApprovalCourse.data.length);
      setHandleApprovalCourse(responseHandleApprovalCourse.data.length);
      
      const responseHandlePayment = await axiosClient.get(
        `/courseRegisters/getcoursenoactive`
      );
      const filteredUsers = responseHandlePayment.data.filter(
        (user) => user.isActive === null || user.isActive === false
      );
      console.log("handleApprovalCourse: ", filteredUsers.length);
      setHandlePayment(filteredUsers.length);
      const responseHandleApprovalUser = await axiosClient.get(`/users/role=4`);
      console.log(
        "handleApprovalUser: ",
        responseHandleApprovalUser.data.length
      );
      setHandleApprovalUser(responseHandleApprovalUser.data.length);

      const responseHandleFeedback = await axiosClient.get(`/feedbacks`);
      const filteredFeedback = responseHandleFeedback.data.filter(
        (feedback) => feedback.isDeleted === null || feedback.isDeleted === false
      );
      console.log(
        "handleFeedback: ",
        filteredFeedback.length
      );
      setHandleFeedback(filteredFeedback.length);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
        <div class="d-flex align-items-center">
          <p class="fw-bold fs-3 mb-0">
            Chào mừng bạn đã đến với trang quản trị viên
          </p>
          {totalPrice == 0 && (
            <div class="d-flex align-items-center ms-2">
              <div
                class="spinner-border"
                role="status"
                aria-hidden="true"
              ></div>
            </div>
          )}
          {isLoading ? (
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            ) : (
              <div></div>
            )}
        </div>

        <div>
          <div
            className="mb-3 p-2 rounded-2 col-md-5 d-inline-block"
            style={{ backgroundColor: "#e6e6fa" }}
          >
            <p className="fw-bold">Thông tin bán hàng</p>
            <p>
              Số lượng khóa học đã bán ngày hôm nay: {soldDay} &nbsp; <br />
            </p>
            <p>Số lượng khóa học đã bán tháng này: {soldMonth}</p>
            <p>Tổng số lượng khóa học đã bán : {totalSold}</p>
          </div>
          &nbsp;&nbsp;
          <div
            className="mb-3 p-2 rounded-2 col-md-5 d-inline-block"
            style={{ backgroundColor: "#e6e6fa" }}
          >
            <p className="fw-bold">Thông tin doanh thu</p>
            <p>Doanh thu hôm nay: {priceDay} vnđ</p>
            <p>Doanh thu tháng nay: {priceMonth} vnđ</p>
            <p>Tổng doanh thu: {totalPrice} vnđ</p>
          </div>
          <div className="mb-3 d-inline-block border p-2">
            <p className="fw-bold">Công việc cần xử lý:</p>            
            <p><span className="text-primary">{handleApprovalUser}</span>  người dùng đang chờ <a className="" target="_blank" href="/admin/upgrade-to-teacher">phê duyệt</a></p>            
            <p><span className="text-primary">{handleApprovalCourse}</span>  khóa học đang chờ <a className="" target="_blank" href="/admin/course-approval">phê duyệt </a></p>
            <p className="py-1"> <span className="text-primary">{handlePayment}</span>  thanh toán đang chờ <a className="" target="_blank" href="/admin/payment-confirm">xử lý</a>  </p>
            <p><span className="text-primary">{handleFeedback}</span>  phản hồi đang chờ <a className="" target="_blank" href="/admin/feedback">xử lý</a></p>                                    
          </div>
          {/* filter lọc ngày tháng năm */}
          <div className="mx-5 px-2 mb-3 d-inline-block border p-2 ">
            <p className="fw-bold ">Lọc theo thời gian</p>  
            <div className="flex-row my-4">
            <label  htmlFor="dateStart">Từ ngày:</label>
            <input              
              type="date"
              id="dateStart"
              name="dateStart"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <label  htmlFor="dateEnd">Đến ngày:</label>
            <input              
              type="date"
              id="dateEnd"
              name="dateEnd"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />   
             <button
              className="badge bg-primary text-wrap"
              onClick={handleFilter}
            >
              Lọc
            </button>
            </div>                   
            <hr className="my-4"></hr>
            <p >Doanh thu : {totalPriceInTime} vnđ</p>
            <p>Số lượng khóa học: {totalSoldInTime}</p>                        
          </div>
          <br />
        </div>
        {/* statics 2 */}
        <div
          className="card"
          style={{
            height: "600px",
            width: "100%",
            paddingBottom: "150px",
            paddingTop: "10px",
            backgroundColor: "",
          }}
        >
          <div className="container">
            <div className="row justify-content-left">
              <div className="col-md-6">
                <div className="card p-3 mb-3">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center">
                      <label className="fw-bold me-2" htmlFor="yearRadio">
                        Chọn năm: &nbsp;
                      </label>
                      <input
                        type="number"
                        id="dateEndYear"
                        name="dateEnd"
                        value={selectedYear2}
                        onChange={handleYearChange2}
                        placeholder="Nhập năm"
                        min="1900"
                        max="2100"
                        className="form-control "
                        style={{ width: "150px" }}
                      />
                      {isLoadingChart2 && (
                        <div className="ms-3">
                          <div
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </main>
    </div>
  );
}

export default Admin;
