import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";

export default function NewCourse() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState(0);
  const encodedId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const userId = atob(encodedId);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    if (price && discountCode) {
      const parsedPrice = parseFloat(price.replace(/\./g, ""));
      const parsedDiscountCode = parseFloat(discountCode);
      const newPromotionalPrice = parsedPrice * (1 - parsedDiscountCode / 100);
      setPromotionalPrice(newPromotionalPrice);
    } else {
      setPromotionalPrice(0);
    }
  }, [price, discountCode]);

  const formatCurrency = (value) => {
    const roundedValue = Math.round(value);
    return roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceInput = (e) => {
    const inputPrice = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(inputPrice, 10);

    if (!isNaN(numericValue) && numericValue <= 100000000) {
      setPrice(formatCurrency(inputPrice));
    } else {
      setFormError("Vui lòng số tiền dưới 100.000.000 VNĐ");
    }
  };
  const handleDiscountCodeInput = (e) => {
    const inputDiscountCode = e.target.value.replace(/\D/g, "");
    if (inputDiscountCode !== "") {
      const discountCodeValue = parseInt(inputDiscountCode, 10);
      if (
        !isNaN(discountCodeValue) &&
        discountCodeValue >= 0 &&
        discountCodeValue <= 100
      ) {
        setDiscountCode(discountCodeValue.toString());
      }
    } else {
      setDiscountCode("");
    }
  };

  const validateForm = () => {
    if (
      !document.getElementById("courseName").value ||
      !selectedCategory ||
      !selectedImage ||
      // !document.getElementById("introduce").value ||
      !price ||
      !discountCode
    ) {
      setFormError("Vui lòng nhập đầy đủ thông tin cho tất cả các trường");
      return false;
    }

    setFormError("");
    return true;
  };

  const [courseIDCreate, setCouseIDCreate] = useState();
  const [introduce, setIntroduce] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const trimInput = (value) => value.trim();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedImage);

      const uploadResponse = await axiosClient.post(
        "cloud/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = uploadResponse.data.data;
      const parsedPrice = parseFloat(price.replace(/\./g, ""));
      const parsedDiscountCode = parseFloat(discountCode);

      const promotionalPrice = Math.round(
        parsedPrice * (1 - parsedDiscountCode / 100)
      );

      const response = await axiosClient.post("/courses", {
        title: trimInput(document.getElementById("courseName").value),
        price: parsedPrice,
        sold: parsedDiscountCode,
        promotional_price: promotionalPrice,
        description: trimInput(document.getElementById("description").value),
        introduce: introduce,
        active: false,
        rating: 0,
        image: imageUrl,
        categoryId: parseInt(selectedCategory, 10),
        userId: userId,
      });
      console.log(response.data);
      if (response.data.Id) {
        setCouseIDCreate(response.data.Id);
      }
      setSuccessMessage("Khóa học đã được tạo thành công");

      console.log(response.data);
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (content) => {
    console.log("Content was updated:", content);
    setIntroduce(content);
  };
  const [image, setImage] = useState("");
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(e.target.files[0]);
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
      setIsShowImage(true);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const [isShowImage, setIsShowImage] = useState(false);

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-12 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5 fw-bold">
                  Tạo khóa học
                </h2>

                <div className="container">
                  <h2 className="my-4">Tạo thông tin khóa học</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3 card p-2">
                      <label
                        htmlFor="courseName"
                        className="form-label fw-bold"
                      >
                        <p className="fs-5 mb-0 pb-0">Tên khóa học *</p>
                      </label>
                      <p className="small">
                        <strong>Hướng dẫn:</strong> Tên khóa học là yếu tố quan
                        trọng để thu hút người học và truyền tải chính xác nội
                        dung mà khóa học cung cấp. Dưới đây là một số mẹo và ví
                        dụ để giúp bạn đặt tên khóa học một cách hiệu quả:
                        <br />
                        <strong>Rõ ràng và súc tích:</strong> Tên khóa học nên
                        phản ánh chính xác nội dung mà bạn sẽ giảng dạy. Tránh
                        sử dụng những từ ngữ quá phức tạp hoặc khó hiểu.
                        <br />
                        <strong>Nổi bật lợi ích chính:</strong> Đảm bảo tên khóa
                        học nêu bật lợi ích hoặc kỹ năng chính mà người học sẽ
                        đạt được sau khi hoàn thành khóa học.
                        <br />
                        <strong>Gợi cảm hứng và hấp dẫn:</strong> Sử dụng ngôn
                        ngữ tích cực và gợi cảm hứng để kích thích sự hứng thú
                        của người học.
                        <br />
                        <strong>Đúng đối tượng mục tiêu:</strong> Đảm bảo tên
                        khóa học phù hợp với đối tượng học viên mà bạn hướng
                        đến.
                      </p>

                      <input
                        type="text"
                        className="form-control"
                        id="courseName"
                        placeholder="Nhập tên khóa học"
                      />
                    </div>
                    <div className="row">
                      <div className="col-3 mb-3">
                        <label
                          htmlFor="category"
                          className="form-label fw-bold"
                        >
                          Danh mục *
                        </label>
                        <select
                          className="form-select"
                          id="category"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="" disabled selected>
                            Chọn danh mục...
                          </option>
                          <option value={11}>Ngoại ngữ</option>
                          <option value={14}>Marketing</option>
                          <option value={24}>Tin học văn phòng</option>
                          <option value={25}>Thiết kế</option>
                          <option value={26}>Phát triển bản thân</option>
                          <option value={12}>Công nghệ thông tin</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3 mb-3">
                        <label htmlFor="upload" className="form-label fw-bold">
                          Tải ảnh *
                        </label>

                        {isShowImage && (
                          <div className="image-container mb-3">
                            <img
                              className="img-fluid rounded"
                              alt="Selected"
                              src={image}
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}

                        <input
                          type="file"
                          className="form-control"
                          id="upload"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-bold"
                      >
                        Mô tả *
                      </label>
                      <p>
                        Ví dụ: Khóa học này sẽ giúp bạn nắm vững kỹ năng đệm hát
                        Guitar, tự tin chơi những bài hát yêu thích chỉ trong 4
                        tuần.
                      </p>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="2"
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="introduce" className="form-label fw-bold">
                        Giới thiệu *
                      </label>
                      <p>
                        Ví dụ: "Bạn có biết rằng giao tiếp ứng xử là một kỹ năng
                        sống quan trọng nhất trong cuộc đời mỗi người? Dù là học
                        sinh, sinh viên, người đi làm hay các bà nội trợ, ai
                        cũng cần giao tiếp hiệu quả trong các tình huống của
                        cuộc sống và xã hội. Giao tiếp chính là chìa khóa thành
                        công và hạnh phúc. Với phong cách điềm đạm, gần gũi và
                        những bài học được đúc rút từ kinh nghiệm phong phú,
                        thầy Phan Văn Trường sẽ giúp bạn nắm vững nghệ thuật
                        giao tiếp và đàm phán. Khóa học bao gồm các kỹ năng từ
                        cơ bản đến nâng cao, cách mở rộng mối quan hệ, nắm bắt
                        tâm lý đối phương và tạo ra kết quả tốt đẹp trong các
                        cuộc giao tiếp. Hãy tham gia khóa học Nghệ thuật Giao
                        tiếp và Đàm phán ngay hôm nay để trở thành bậc thầy giao
                        tiếp và đàm phán!"
                      </p>
                      {/* <textarea
                        className="form-control"
                        id="introduce"
                        rows="4"
                        value={introduce}
                        onChange={handleChangeIntroduce}
                      ></textarea> */}
                      <Editor
                        apiKey="fdzsrqptrthigulkcrque8fvlzm6vaoxf8l7ujy4q4269zrm"
                        initialValue="<p>This is the initial content of the editor</p>"
                        init={{
                          height: 500,
                          menubar: false,
                          plugins: [
                            "advlist autolink lists link image",
                            "charmap print preview anchor help",
                            "searchreplace visualblocks code",
                            "insertdatetime media table paste wordcount",
                          ],
                          toolbar:
                            "undo redo | formatselect | bold italic | \
      alignleft aligncenter alignright | \
      bullist numlist outdent indent | help",
                        }}
                        onEditorChange={handleEditorChange}
                      />
                    </div>

                    <div className="row">
                      <div className="col-6 mb-3">
                        <label htmlFor="price" className="form-label fw-bold">
                          Giá tiền *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="price"
                          value={price}
                          onInput={handlePriceInput}
                        />
                      </div>

                      <div className="col-6 mb-3">
                        <label
                          htmlFor="discountCode"
                          className="form-label fw-bold"
                        >
                          Giảm giá (%) *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="discountCode"
                          value={discountCode}
                          onInput={handleDiscountCodeInput}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="promotionalPrice"
                        className="form-label fw-bold"
                      >
                        Giá khuyến mãi *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="promotionalPrice"
                        value={formatCurrency(promotionalPrice)}
                        readOnly
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      {loading ? "Đang tải..." : "Tạo khóa học"}
                    </button>

                    {formError && (
                      <div className="alert alert-danger pt-3" role="alert">
                        {formError}
                      </div>
                    )}

                    {successMessage && (
                      <div className="alert alert-success pt-3" role="alert">
                        {successMessage}
                        <p>Vui lòng cập nhật các thông tin tiếp theo!</p>
                        <a
                          href={`/teacher/course/edit-course/${courseIDCreate}`}
                          className="btn btn-primary"
                        >
                          Tiếp theo!
                        </a>
                      </div>
                    )}

                    {loading && (
                      <div className="alert alert-info pt-3" role="alert">
                        Đang tải khóa học, vui lòng đợi...
                      </div>
                    )}
                  </form>
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
