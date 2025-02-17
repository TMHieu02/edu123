import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const bankList = [
  "",
  "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
  "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
  "Ngân hàng TMCP Quốc Tế (VIB)",
  "Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam (EIB)",
  "Ngân hàng TMCP Quân Đội (MBank)",
  "Ngân hàng TMCP Phát Triển TP. Hồ Chí Minh (HDBank)",
  "Ngân hàng TMCP Á Châu (ACB)",
  "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)",
  "Ngân hàng TMCP Quốc Dân (NCB)",
  "Ngân hàng TMCP Hàng Hải (MSB)",
  "Ngân hàng TMCP Việt Á (VAB)",
  "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPB)",
  "Ngân hàng Thương mại trách nhiệm hữu hạn một thành viên Dầu Khí Toàn Cầu (GPBank)",
  "Ngân hàng TMCP Phương Đông (OCB)",
  "Ngân hàng TMCP Đại Dương (OJB)",
  "Ngân hàng TMCP Bắc Á (BAB)",
  "Ngân hàng TMCP An Bình (ABB)",
  "Ngân hàng TMCP Tiên Phong (TPB)",
  "Ngân hàng TMCP Bưu Điện Liên Việt (LPB)",
  "Ngân hàng TMCP Sài Gòn Hà Nội (SHB)",
  "Ngân hàng TMCP Bảo Việt (BVB)",
  "Ngân hàng TMCP Đông Á (DongABank)",
  "Ngân hàng TMCP Công Thương Việt Nam (Vietinbank)",
  "Ngân hàng Nông Nghiệp và Phát Triển Nông thôn Việt Nam (VARB)",
  "Ngân hàng TMCP Đầu Tư và Phát triển Việt Nam (BIDV)",
  "Ngân hàng TMCP Đông Nam Á (SeABank)",
  "Ngân hàng TMCP Sài Gòn (SCB)",
  "Ngân hàng TMCP Kiên Long (KLB)",
  "Ngân hàng liên doanh Việt Nga (VRB)",
  "Ngân hàng TMCP Nam Á (NAB)",
];

export default function PaymentInformation() {
  const [bankname, setBankName] = useState("");
  const [accountnumber, setAccountNumber] = useState("");
  const [accountname, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchUserData() {
        try {
          const encodedId = localStorage.getItem("userId");
          const userId = atob(encodedId);

          const response = await axiosClient.get(`users/${userId}`);
          const userData = response.data;

          setBankName(userData.bank_name);
          setAccountNumber(userData.account_number);
          setAccountName(userData.account_name);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      fetchUserData();
    }
  }, [isAuthenticated]);

  const fieldsToUpdate = {
    bank_name: bankname,
    account_number: accountnumber,
    account_name: accountname,
  };

  const handleSubmit = async () => {
    if (!bankname) {
      setError("Vui lòng nhập thông tin tên ngân hàng!");
      setSuccess("");
      return;
    }
    if (!accountnumber) {
      setError("Vui lòng nhập thông tin số tài khoản!");
      setSuccess("");
      return;
    }
    if (!accountname) {
      setError("Vui lòng nhập thông tin tên tài khoản!");
      setSuccess("");
      return;
    }

    try {
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);

      const response = await axiosClient.patch(
        `/users/${userId}`,
        fieldsToUpdate
      );
      if (response.data.account_name) {
        setSuccess("Bạn đã cập nhật thành công!");
        setError("");
      }
      console.log("User updated:", response.data);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const encodedId = localStorage.getItem("userId");
      const userId = atob(encodedId);

      const response = await axiosClient.get(`users/${userId}`);
      const userData = response.data;
      const response2 = await axiosClient.post("/auth/check-login", {
        email: userData.email,
        password: password,
      });

      if (response2.data == true) {
        setIsAuthenticated(true);
      } else {
        setError("Mật khẩu không đúng");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching user data:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-9 col-md-7 col-lg-5">
              <div className="card border-0 shadow rounded-3 my-5">
                <div className="card-body p-4 p-sm-5">
                  <h3 className="card-title text-center mb-5 fw-bold">
                    Vui lòng nhập mật khẩu trước khi cập nhật thông tin tài
                    khoản ngân hàng
                  </h3>
                  <form onSubmit={handlePasswordSubmit}>
                    {isLoading ? (
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <div className="form-outline mb-4">
                      <label className="form-label fw-bold" htmlFor="password">
                        Mật khẩu *
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button
                      type="submit"
                      className="btn btn-primary btn-block w-100"
                    >
                      Xác nhận
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-9 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5 fw-bold">
                  Thông tin thanh toán
                </h2>
                <div>
                  {" "}
                  {/* Bỏ đi thẻ <form> */}
                  {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
                  {/* {success && <p style={{ color: "blue" }}>{success}</p>} */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}{" "}
                  {/* Chuyển thành div */}
                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}{" "}
                  {/* Chuyển thành div */}
                  <div className="form-outline mb-4">
                    <label className="form-label fw-bold" htmlFor="bankname">
                      Tên ngân hàng *
                    </label>
                    <select
                      className="form-select"
                      name="bankname"
                      value={bankname}
                      onChange={(e) => setBankName(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Chọn ngân hàng
                      </option>
                      {bankList.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-outline mb-4">
                    <label
                      className="form-label fw-bold"
                      htmlFor="accountnumber"
                    >
                      Số tài khoản *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Số tài khoản"
                      name="accountnumber"
                      value={accountnumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label fw-bold" htmlFor="accountname">
                      Tên Chủ Thẻ *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Họ và tên"
                      name="accountname"
                      value={accountname}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary btn-block mb-4 w-100"
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
