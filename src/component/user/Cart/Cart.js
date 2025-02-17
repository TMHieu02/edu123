import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faClose } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Modal from "react-modal";

const formatPrice = (price) => {
  if (typeof price !== "string") {
    price = String(price);
  }

  if (price.startsWith("0")) {
    price = price.slice(1);
  }

  return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [cartIndex, setCartIndex] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading
  const [isChoose, setIsChoose] = useState(false);
  // tiền hiển thị panel thanh toán
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPromotionalPrice, setTotalPromotionalPrice] = useState(0);
  const getPayment = () => {
    // tổng số tiền
    let totalPrice = 0;
    let totalPromotionalPrice = 0;
    const paymentCart = [];
    //
    let anyCoursePayment = false;

    for (let i in cartIndex) {
      if (cartIndex[i].isChoose === true) {
        totalPrice += cartIndex[i].price;
        totalPromotionalPrice += cartIndex[i].promotional_price;
        anyCoursePayment = true;
        paymentCart.push(cartIndex[i].cart_id);
      }
    }
    if (anyCoursePayment) {
      setIsChoose(true);
    }
    console.log("total price", totalPrice);
    setTotalPrice(totalPrice);
    console.log("total promotional price", totalPromotionalPrice);
    setTotalPromotionalPrice(totalPromotionalPrice);
    console.log("payment course_id", paymentCart);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encodedUserId = localStorage.getItem("userId");
        const userId = parseInt(atob(encodedUserId), 10);
        setIsLoading(true);

        const response = await axiosClient.get(`/carts/user/${userId}`);
        const allCartItems = response.data;

        // Filter out items with isDeleted set to true
        const filteredCartItems = allCartItems.filter(
          (item) => !item.isDeleted
        );
        console.log(filteredCartItems);
        setCartData(filteredCartItems);

        // Tạo mảng cartIndex từ filteredCartItems
        const newCartIndex = filteredCartItems.map((item) => ({
          course_id: item.course_id,
          cart_id: item.cart_id,
          price: item.price,
          promotional_price: item.promotional_price,
          isChoose: false,
        }));

        setCartIndex(newCartIndex);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (itemId) => {
    try {
      await axiosClient.delete(`/carts/${itemId}`);
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);

      const response = await axiosClient.get(`/carts/user/${userId}`);
      const allCartItems = response.data;

      // Filter out items with isDeleted set to true
      const filteredCartItems = allCartItems.filter((item) => !item.isDeleted);

      setCartData(filteredCartItems);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  function generateRandomNumber() {
    let output = "";

    // Tạo một vòng lặp để thêm 6 số ngẫu nhiên
    for (let i = 0; i < 6; i++) {
      const randomNumber = Math.floor(Math.random() * 10); // Tạo số từ 0 đến 9
      output += randomNumber.toString(); // Ghép vào chuỗi output
    }

    return output;
  }

  const handleCheckout = () => {
    if (isChoose) {
      const otp = generateRandomNumber();
      const inforArray = cartIndex
        .filter((item) => item.isChoose) // Chỉ lấy các mục có isChoose là true
        .map((item) => {
          return {
            course_id: item.course_id,
            cart_id: item.cart_id,
            otp: otp,
          };
        });
      console.log(inforArray);
      const firstCartItem = cartData[0];
      const firstCourseId = firstCartItem.course_id;
      const cartId = firstCartItem.cart_id;
      let totalPayment;
      if (totalPrice === totalPromotionalPrice) {
        totalPayment = totalPrice;
      } else {
        totalPayment = totalPromotionalPrice;
      }

      navigate(`/user/order/${firstCourseId}/${cartId}/${otp}`, {
        state: { inforArray, totalPayment },
      });
    } else {
      const isConfirmed = window.confirm(
        "Giỏ hàng không có khóa học! Vui lòng chọn khóa học trước khi thanh toán!"
      );

      if (!isConfirmed) {
        return;
      }
    }
  };

  const handleVNPay = async (e) => {
    e.preventDefault();

    if (cartData.length === 0) {
      console.log("Cart is empty");
      alert(
        "Giỏ hàng không có khóa học! Vui lòng chọn khóa học trước khi thanh toán!"
      );
      return;
    }

    try {
      const encodedUserId = localStorage.getItem("userId");
      const userId = parseInt(atob(encodedUserId), 10);

      // Tạo mảng chứa userId và courseId
      const inforArray = cartIndex
        .filter((item) => item.isChoose) // Chỉ lấy các mục có isChoose là true
        .map((item) => item.course_id);

      // Thêm userId vào đầu mảng
      inforArray.unshift(userId);

      // Chuyển đổi mảng thành chuỗi, ngăn cách bằng khoảng trắng
      const inforString = inforArray.join(" ");
      console.log("inforString:", inforString);

      const response = await axiosClient.post("/vnpay/create_payment", {
        amount: totalPromotionalPrice * 100,
        infor: inforString,
      });

      // Xử lý dữ liệu trả về từ VNPAY
      if (response.data) {
        window.location.href = response.data; // Chuyển hướng đến trang thanh toán của VNPAY
      } else {
        console.error("No response data from VNPAY");
        alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error during VNPAY payment:", error);
      alert("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại sau.");
    }
  };

  // modal hiển thị option
  let subtitle;
  const [modalIsOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }
  function afterOpenModal() {
    subtitle.style.color = "#f00";
  }

  function closeModal() {
    setIsModalOpen(false);
  }
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
  return (
    <div>
      <Header />

      <section className="h-100 gradient-custom">
        <div className="container py-5">
          <div className="row d-flex justify-content-center my-4">
            <div className="col-md-6">
              <div className="card-header py-3">
                <p style={{ fontWeight: "bold", fontSize: "1.5em" }}>
                  Giỏ hàng
                </p>
                <p style={{ fontSize: "1.25em" }}>
                  {cartData.length} khóa học trong giỏ hàng
                </p>
              </div>
              <hr className="pt-2" />
              <div>
                {isLoading ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              {cartData.map((item, index) => (
                <div>
                  <div
                    key={item.cart_id}
                    className="card-body d-flex align-items-center"
                  >
                    <div style={{ paddingRight: 10 }}>
                      <input
                        type="checkbox"
                        checked={cartIndex[index] && cartIndex[index].isChoose}
                        style={{ transform: "scale(1.5)" }}
                        onChange={(e) => {
                          const updatedCartIndex = [...cartIndex];
                          updatedCartIndex[index].isChoose =
                            !updatedCartIndex[index].isChoose;
                          console.log("cart index: ", updatedCartIndex);
                          setCartIndex(updatedCartIndex);
                          getPayment();
                        }}
                      />
                    </div>
                    <Link
                      to={`/user/course/${item.course_id}`}
                      className="d-inline-block"
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "80px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={item.image}
                          className="img-fluid"
                          alt={item.user_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "fill",
                          }}
                        />
                      </div>
                    </Link>
                    <div style={{ paddingLeft: 5 }}>
                      <p style={{ fontWeight: "550", paddingTop: 10 }}>
                        {item.title}
                      </p>
                      <p style={{ color: "gray" }}>
                        Giảng viên: {item.user_name}
                        <br />
                        {"⭐".repeat(Math.floor(item.rating))}{" "}
                        <span>({item.rating.toFixed(1)})</span>
                      </p>
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-danger btn-sm me-1 mb-2"
                        onClick={() => handleDelete(item.cart_id)}
                        style={{ marginLeft: "auto" }}
                      >
                        <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                      </button>
                      <div style={{ paddingLeft: 10 }}>
                        {item.price === item.promotional_price ? (
                          <div className="d-flex">
                            <p className="fs-5 fw-bold">
                              {formatPrice(item.price)}
                            </p>
                            <span className="fs-5 fw-bold">đ</span>
                          </div>
                        ) : (
                          <div>
                            <div>
                              <span className="fs-5 fw-bold">
                                {formatPrice(item.promotional_price)}
                              </span>
                              <span className="fs-6 fw-bold">đ</span>
                            </div>
                            <span
                              className="small"
                              style={{ textDecoration: "line-through" }}
                            >
                              {formatPrice(item.price)}
                            </span>
                            <span className="small">đ</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <hr className="p-1" />
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            <div className="col-md-4" style={{ marginLeft: "50px" }}>
              <div className=" pt-3">
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.5em",
                    color: "gray",
                  }}
                >
                  Tổng
                </p>
              </div>
              <div
                style={{
                  paddingBottom: 10,
                }}
              >
                {totalPrice === totalPromotionalPrice && totalPrice != 0 && (
                  <div>
                    <span className="fs-5 fw-bold">
                      {formatPrice(totalPrice)}
                    </span>
                    <span className="fs-6 fw-bold text-decoration-underline">
                      đ
                    </span>
                  </div>
                )}
                {totalPrice != totalPromotionalPrice && totalPrice && (
                  <div>
                    <span className="fs-5 fw-bold">
                      {formatPrice(totalPromotionalPrice)}
                    </span>
                    <span className="fs-6 fw-bold text-decoration-underline ">
                      đ
                    </span>
                    <span className="text-base text-decoration-line-through p-2">
                      {formatPrice(totalPrice)}
                    </span>
                    <span className="text-base text-decoration-line-through">
                      đ
                    </span>
                  </div>
                )}
                {totalPrice === totalPromotionalPrice && totalPrice == 0 && (
                  <div>
                    <span className="text-3xl font-bold">0</span>
                    <span className="text-2xl font-bold underline">đ</span>
                  </div>
                )}

                {/* <button
                    type="button"
                    className="btn btn-primary btn-lg btn-block"
                    onClick={handleCheckout}
                  >
                    Thanh toán ngay
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg btn-block"
                    onClick={handleVNPay}
                  >
                    Thanh toán VNPAY
                  </button> */}
              </div>
              <div
                style={{
                  display: "flex",
                  alignContent: "center",
                  alignItems: "center",
                  width: "90%",
                }}
              >
                <button
                  style={{ paddingLeft: 10, width: "90%" }}
                  className="btn btn-primary"
                  onClick={openModal}
                >
                  <p className="fw-bold fs-5 pb-0 mb-0">Thanh toán</p>
                </button>
              </div>
              <hr className="my-4 w-4/5" />
            </div>
          </div>
        </div>
      </section>
      {/* modal thông báo option thanh toán */}
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2
          style={{ fontWeight: "bold", color: "black", flex: "1" }}
          ref={(_subtitle) => (subtitle = _subtitle)}
        ></h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              color: "black",
              flex: "1",
              fontSize: "1.25em",
            }}
          ></h2>
          <FontAwesomeIcon icon={faClose} onClick={closeModal} />
        </div>

        <div style={{ width: "450px", paddingTop: 10 }}></div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 10,
          }}
        >
          <button
            onClick={handleCheckout}
            style={{
              width: "90%",
              padding: "5px",
              marginTop: "5px",
              borderRadius: "5px",
              backgroundColor: "white",
              border: "none",
              cursor: "pointer",
              border: "1px solid black", // Thêm viền màu đen
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="https://png.pngtree.com/png-clipart/20230805/original/pngtree-bank-transfer-icon-bank-send-pictogram-vector-picture-image_9732091.png"
              alt="vnpay"
              style={{ width: "35px", height: "35px", marginRight: "10px" }}
            />
            <span>Chuyển khoản</span>
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleVNPay}
            style={{
              width: "90%",
              padding: "5px",
              marginTop: "5px",
              borderRadius: "5px",
              backgroundColor: "white",
              border: "none",
              cursor: "pointer",
              border: "1px solid black", // Thêm viền màu đen
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="data:image/png;base64,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"
              alt="vnpay"
              style={{ width: "35px", height: "35px", marginRight: "10px" }}
            />
            <span>Cổng thanh toán VNPay</span>
          </button>
        </div>
      </Modal>
      <Footer />
    </div>
  );
}
