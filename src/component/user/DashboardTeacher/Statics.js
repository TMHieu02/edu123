import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
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

export default function Statics() {
  const navigate = useNavigate();
  const [totalSold, setTotalSold] = useState(0);
  const [soldDay, setSoldDay] = useState(0);
  const [soldMonth, setSoldMonth] = useState(0);

  const [totalPrice, setTotalPrice] = useState(0);
  const [priceDay, setPriceDay] = useState(0);
  const [priceMonth, setPriceMonth] = useState(0);

  const formatPrice = (price) => {
    if (typeof price !== "string") {
      price = String(price);
    }
    if (price === "0") {
      return "0";
    }

    if (price.startsWith("0")) {
      price = price.slice(1);
    }

    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

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
  const [isLoading, setIsLoading] = useState(false);

  const cardStyle = {
    borderRadius: "0.25rem",
    backgroundColor: "#e6e6fa",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    display: "inline-block",
    width: "350px",
    height: "200px",
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const encodedUserId = localStorage.getItem("userId");
        const userId = parseInt(atob(encodedUserId), 10);
        const responseUser = await axiosClient.get(`/users/${userId}`);
      const commission = responseUser.data.commission;
        console.log(userId);
  
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
  
        // Tạo các promise cho các yêu cầu API
        const promises = [
          axiosClient.get(`/courseRegisters/total-course-in-day-per-teacher/${formattedDate}/${userId}`),
          axiosClient.get(`/courseRegisters/total-course-in-month-per-teacher/${formattedMonthYear}/${userId}`),
          axiosClient.get(`/courseRegisters/total-price-in-day-per-teacher/${formattedDate}/${userId}`),
          axiosClient.get(`/courseRegisters/total-price-in-month-per-teacher/${formattedMonthYear}/${userId}`),
          axiosClient.get(`/courseRegisters/total-course-per-teacher/${userId}`),
          axiosClient.get(`/courseRegisters/total-price-per-teacher/${userId}`)
        ];
  
        // Thực hiện các yêu cầu đồng thời
        const [
          response,
          response2,
          response_price_day,
          response_price_month,
          response_total_sold,
          response_total_price
        ] = await Promise.all(promises);
  
        // Cập nhật state với dữ liệu từ các yêu cầu
        setSoldDay(response.data);
        setSoldMonth(response2.data);
        setPriceDay(formatPrice(response_price_day.data));
        setPriceMonth(formatPrice(response_price_month.data*commission/100));
        setTotalSold(response_total_sold.data);
        setTotalPrice(formatPrice(response_total_price.data*commission/100));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  
    fetchUserData();
  }, []);
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handleFilter = async () => {
    try {
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);
      const formattedStart = formatDate(dateStart);
      const formattedEnd = formatDate(dateEnd);
      setIsLoading(true);
      const price = await axiosClient.get(
        `/courseRegisters/total-price-in-time-per-teacher/${formattedStart}/${formattedEnd}/${userId}`
      );
      setTotalPriceInTime(formatPrice(price.data));

      const sold = await axiosClient.get(
        `/courseRegisters/total-sold-in-time-per-teacher/${formattedStart}/${formattedEnd}/${userId}`
      );
      setTotalSoldInTime(formatPrice(sold.data));
      setIsLoading(false);
    } catch (error) {
      console.error("Error formatting dates or navigating:", error);
    }
  };

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Quantity",
        backgroundColor: "#3e95cd",
        data: [],
      },
      {
        label: "Total Money",
        backgroundColor: "#8e5ea2",
        data: [],
      },
    ],
  });
  const [staticsTitle, setStaticsTitle] = useState("");
  const chartOptions = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text:
          "Biểu Đồ Cột Số Lượng và Doanh Thu Từng Khóa Học của Giảng Viên " +
          staticsTitle,
        color: "black",
        font: {
          family: "Comic Sans MS",
          size: 20,
          weight: "bold",
          lineHeight: 1.2,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getTeacherProperties = async (startDate, endDate, commission) => {
    try {
      if (!startDate || !endDate) {
        return [];
      }
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);
      console.log("start date function: ", startDate);
      console.log("end date function: ", endDate);
      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${userId}?startDate=${startDate}&endDate=${endDate}`
        // `/courseRegisters/payment/teacherWithCourses/10?startDate=2024-05-01&endDate=2024-05-31`
      );
      console.log("mergedCourses : ", mergedCourses.data);
      const data = [];
      let title;
      let price;
      let quantity;
      let money;
      mergedCourses.data.forEach((course) => {
        title = course.title;
        price = course.promotional_price;
        quantity = 0;
        money = 0;
        course.courseRegisters.forEach((detail) => {
          quantity += 1;
        });
        money = price * quantity;
        const itemData = {
          title: title,
          quantity: quantity,
          money: (money * commission) / 100,
        };
        data.push(itemData);
      });

      console.log("data: ", data);
      return data;
    } catch (error) {
      console.error("Error fetching data statics:", error);
      return [];
    }
  };
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Tăng tháng hiện tại lên 1
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
  );
  const [selectedYear, setSeletedYear] = useState(`${currentYear}`);
  const handleCheckedYearChange = () => {
    setIsCheckedYear(true);
    setIsCheckedMonth(false);
    fetchDataYearStatics1(selectedYear);
  };
  const handleYearChange = (event) => {
    setSeletedYear(event.target.value);
    setIsCheckedYear(true);
    setIsCheckedMonth(false);
    fetchDataYearStatics1(event.target.value);
  };
  const [isLoadingChart1, setIsLoadingChart1] = useState(false);
  const [isCheckedYear, setIsCheckedYear] = useState(false);
  const [isCheckedMonth, setIsCheckedMonth] = useState(true);
  const fetchDataMonthStatics1 = async (selectedMonth) => {
    try {
      setIsLoadingChart1(true);
      const selectedDate = new Date(selectedMonth); // Lấy giá trị từ input date
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      setStaticsTitle("Tháng " + (month + 1) + " Năm " + year);
      // Ngày bắt đầu là ngày đầu tiên của tháng được chọn
      const startOfMonth = new Date(year, month, 1);

      // Ngày cuối tháng là ngày cuối cùng của tháng được chọn
      const endOfMonth = new Date(year, month + 1, 0);

      const startFormatted = formatDateFunction(
        startOfMonth.toLocaleDateString()
      );
      const endFormatted = formatDateFunction(endOfMonth.toLocaleDateString());
      console.log("startFormatted: ", startFormatted);
      console.log("endFormatted: ", endFormatted);
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      const responseUser = await axiosClient.get(`/users/${userId}`);
      const commission = responseUser.data.commission;

      const data = await getTeacherProperties(
        startFormatted,
        endFormatted,
        commission
      );
      const newChartData = {
        labels: data.map((item) => item.title),
        datasets: [
          {
            label: "Số lượng bán",
            backgroundColor: "#3e95cd",
            data: data.map((item) => item.quantity),
          },
          {
            label: "Tổng số tiền",
            backgroundColor: "#8e5ea2",
            data: data.map((item) => item.money),
          },
        ],
      };
      setChartData(newChartData);
      setIsLoadingChart1(false);
    } catch (error) {
      setIsLoadingChart1(false);
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDataMonthStatics1(selectedMonth);
  }, []);

  const fetchDataYearStatics1 = async (selectedYear) => {
    try {
      setIsLoadingChart1(true);
      const year = selectedYear;
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      setStaticsTitle("Năm " + year);

      const startFormatted = formatDateFunction(
        startOfYear.toLocaleDateString()
      );
      const endFormatted = formatDateFunction(endOfYear.toLocaleDateString());
      console.log("startFormatted: ", startFormatted);
      console.log("endFormatted: ", endFormatted);
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);
      const responseUser = await axiosClient.get(`/users/${userId}`);
      const commission = responseUser.data.commission;

      const data = await getTeacherProperties(
        startFormatted,
        endFormatted,
        commission
      );
      const newChartData = {
        labels: data.map((item) => item.title),
        datasets: [
          {
            label: "Số lượng bán",
            backgroundColor: "#3e95cd",
            data: data.map((item) => item.quantity),
          },
          {
            label: "Tổng số tiền",
            backgroundColor: "#8e5ea2",
            data: data.map((item) => item.money),
          },
        ],
      };
      setChartData(newChartData);
      setIsLoadingChart1(false);
    } catch (error) {
      setIsLoadingChart1(false);
      console.error("Error fetching data:", error);
    }
  };
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setIsCheckedMonth(true);
    setIsCheckedYear(false);
    fetchDataMonthStatics1(event.target.value);
  };

  const handleCheckedMonthChange = () => {
    setIsCheckedMonth(true);
    setIsCheckedYear(false);
    fetchDataMonthStatics1(selectedMonth);
  };

  const formatDateFunction = (dateString) => {
    const [month, day, year] = dateString
      .split("/")
      .map((item) => item.padStart(2, "0"));
    return `${year}-${month}-${day}`;
  };

  //statics 2
  const [titleStaticsChart2, setTitleStaticsChart2] = useState('');
  const lineChartOptions = {
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text:
          "Biểu Đồ Đường Số Lượng và Doanh Thu Các Khóa Học của Giảng Viên " +
          titleStaticsChart2,
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

  // lấy ra danh sách các ngày đầu và cuối năm của các tháng với dữ liệu đầu vào là 1 tháng, dùng trong trường hợp ko phải là cuối năm
  const generateTimeDisplay = (selectedMonth) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const months = [];

    // Duyệt từ tháng 1 đến tháng đã chọn
    for (let m = 1; m <= month; m++) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0); // Lấy ngày cuối cùng của tháng

      // Tạo chuỗi ngày tháng năm theo định dạng yyyy-MM-dd
      const startFormatted = formatDateFunction(startDate.toLocaleDateString());
      const endFormatted = formatDateFunction(endDate.toLocaleDateString());
      console.log("start format: ", startFormatted);
      const monthData = {
        startDate: startFormatted,
        endDate: endFormatted,
      };

      months.push(monthData);
    }
    console.log("month array: ", months);
    return months;
  };

  const getTeacherPropertiesStatics2 = async (
    startDate,
    endDate,
    commission
  ) => {
    try {
      if (!startDate || !endDate) {
        return {
          title: "",
          quantity: 0,
          money: 0,
        };
      }
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);
      console.log("start date function: ", startDate);
      console.log("end date function: ", endDate);
      const mergedCourses = await axiosClient.get(
        `/courseRegisters/payment/teacherWithCourses/${userId}?startDate=${startDate}&endDate=${endDate}`
        // `/courseRegisters/payment/teacherWithCourses/10?startDate=2024-05-01&endDate=2024-05-31`
      );
      console.log("mergedCourses : ", mergedCourses.data);
      let title = formatMonthYear(startDate);
      let quantity = 0;
      let money = 0;
      let price;
      let quantityPerCourse = 0;
      mergedCourses.data.forEach((course) => {
        price = course.promotional_price;
        quantityPerCourse = 0;
        course.courseRegisters.forEach((detail) => {
          quantity += 1;
          quantityPerCourse += 1;
        });
        money += quantityPerCourse * price;
      });

      return {
        title: title,
        quantity: quantity,
        money: (money * commission) / 100,
      };
    } catch (error) {
      console.error("Error fetching data statics:", error);
      return null;
    }
  };
  const formatMonthYear = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month.padStart(2, "0")}/${year}`;
  };

  const [selectedYear2, setSeletedYear2] = useState(`${currentYear}`);
  const [selectedMonth2, setSelectedMonth2] = useState(
    `${currentYear}-${currentMonth.toString().padStart(2, "0")}`
  );
  const handleYearChange2 = (event) => {
    setSeletedYear2(event.target.value);
    setSelectedMonth2(event.target.value);
    setTitleStaticsChart2('Năm ' + event.target.value);
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
  useEffect(() => {
    fetchDataStatics2();
  }, [selectedMonth2]);
  const fetchDataStatics2 = async () => {
    try {
      setIsLoadingChart2(true);      
      const timeDisplay = generateTimeDisplay(selectedMonth2);
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);
      const responseUser = await axiosClient.get(`/users/${userId}`);
      const commission = responseUser.data.commission;
      setTitleStaticsChart2('Năm ' + selectedYear2);
      // cần dữ liệu commison trước khi gọi các ham dưới 
      const promises = timeDisplay.map((item) => {
        return getTeacherPropertiesStatics2(item.startDate, item.endDate, commission);
      });

      const coursesInfoArray = await Promise.all(promises);
      console.log("course info: ", coursesInfoArray);

      // Lọc dữ liệu và đưa vào các mảng tương ứng
    const labels = coursesInfoArray.map(item => item.title);
    const quantityData = coursesInfoArray.map(item => item.quantity);
    const moneyData = coursesInfoArray.map(item => item.money);

    const newLineChartData = {
      labels: labels,
      datasets: [
        {
          label: "Số lượng bán",
          borderColor: "#3e95cd",
          fill: false,
          data: quantityData
        },
        {
          label: "Tổng số tiền",
          borderColor: "#8e5ea2",
          fill: false,
          data: moneyData
        }
      ]
    };

    setLineChartData(newLineChartData);
      
      
      setIsLoadingChart2(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setIsLoadingChart2(false);
    }
  };

  const [isLoadingChart2, setIsLoadingChart2] = useState(false);
  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <main className="manager-user-main-content col-md-10">
            <p className="text-2xl fw-bold fs-3">Thống kê</p>
            <div className="mb-3 d-inline-block" style={cardStyle}>
              <h6>Thông tin bán hàng</h6>
              <p>
                Số lượng khóa học đã bán ngày hôm nay: {soldDay} &nbsp; <br />
              </p>
              <p>Số lượng khóa học đã bán tháng này: {soldMonth}</p>
              <p>Tổng số lượng khóa học đã bán : {totalSold}</p>
            </div>
            &nbsp;&nbsp;&nbsp;
            <div className="mb-3 d-inline-block">
              <h6>Lọc theo thời gian</h6>
              <label htmlFor="dateStart">Ngày bắt đầu:</label>
              <input
                type="date"
                id="dateStart"
                name="dateStart"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
              <label htmlFor="dateEnd">Ngày kết thúc:</label>
              <input
                type="date"
                id="dateEnd"
                name="dateEnd"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
              &nbsp;
              <button
                className="badge bg-primary text-wrap"
                onClick={handleFilter}
              >
                Lọc
              </button>
              <p>Doanh thu : {totalPriceInTime} vnđ</p>
              <p>Số lượng khóa học: {totalSoldInTime}</p>
              {isLoading ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div style={cardStyle}>
              <h6>Thông tin doanh thu</h6>
              <p>Doanh thu hôm nay: {priceDay} vnđ</p>
              <p>Doanh thu tháng nay: {priceMonth} vnđ</p>
              Tổng doanh thu:{" "}
              {totalPrice === 0 ? (
                <div className="d-flex align-items-center">
                  <strong>Loading...</strong>
                  <div
                    className="spinner-border ms-auto"
                    role="status"
                    aria-hidden="true"
                  ></div>
                </div>
              ) : (
                <p>{totalPrice} vnđ</p>
              )}
            </div>
            {/* statics 1 */}
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
                          <input
                            type="radio"
                            name="dateType"
                            id="yearRadio"
                            checked={isCheckedYear}
                            onChange={handleCheckedYearChange}
                            className="me-2"
                          />
                          <label className="fw-bold me-2" htmlFor="yearRadio">
                            Chọn năm: &nbsp;
                          </label>
                          <input
                            type="number"
                            id="dateEndYear"
                            name="dateEnd"
                            value={selectedYear}
                            onChange={handleYearChange}
                            placeholder="Nhập năm"
                            min="1900"
                            max="2100"
                            className="form-control "
                            style={{ width: "150px" }}
                          />
                        </div>
                        <div className="d-flex align-items-center">
                          <input
                            type="radio"
                            name="dateType"
                            id="monthRadio"
                            checked={isCheckedMonth}
                            onChange={handleCheckedMonthChange}
                            className="me-2"
                          />
                          <label className="fw-bold me-2" htmlFor="monthRadio">
                            Chọn tháng:
                          </label>
                          <input
                            type="month"
                            id="dateEndMonth"
                            name="dateEnd"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="form-control"
                            style={{ width: "150px" }}
                          />
                          {isLoadingChart1 && (
                            <div className="ms-3">
                              <div
                                className="spinner-border spinner-border-sm"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Bar data={chartData} options={chartOptions} />
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
                                <span className="visually-hidden">
                                  Loading...
                                </span>
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
      </div>
      <Footer />
    </div>
  );
}
