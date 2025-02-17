import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Editor } from "@tinymce/tinymce-react";
import { useState, useEffect, useRef } from "react";
import axiosClient from "../../../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function EditCourse() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [promotionalPrice, setPromotionalPrice] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setDescriptionError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams(); // courseID
  const editorRef = useRef(null); // Ref for the editor
  useEffect(() => {
    console.log("introduce: ", introduce);
  }, [introduce]);
  useEffect(() => {
    const checkCourseRegister = async () => {
      try {
        const userIdLocal = localStorage.getItem("userId");
        if (userIdLocal) {
          const userId = parseInt(atob(userIdLocal), 10);
          const response1 = await axiosClient.get(
            `/courses/check/${id}/${userId}`
          );

          if (response1.data === true) {
          } else {
            navigate("/user");
          }
        } else {
          navigate("/user");
        }
      } catch (error) {
        console.error("Error checking course register:", error);
      }
    };

    checkCourseRegister();
  }, [id, navigate]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axiosClient.get(`courses/${id}`);
        const courseData = response.data;

        setTitle(courseData.title);
        setImage(courseData.image);
        setDescription(courseData.description);
        setIntroduce(courseData.introduce);
        setPrice(formatCurrency(courseData.price));
        setDiscountCode(formatCurrency(courseData.sold));
        setSelectedCategory(courseData.categoryId);

        const encodedId = localStorage.getItem("userId");
        const user = parseInt(atob(encodedId), 10);

        if (user !== courseData.userId) {
          navigate("/user");
        }
        checkRequest();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, [id, navigate]);

  useEffect(() => {
    const parsedPrice = parseFloat(price.replace(/\./g, ""));
    const parsedDiscountCode = parseFloat(discountCode);

    if (!isNaN(parsedPrice) && !isNaN(parsedDiscountCode)) {
      const newPromotionalPrice = parsedPrice * (1 - parsedDiscountCode / 100);
      setPromotionalPrice(newPromotionalPrice);
    }
  }, [price, discountCode]);

  const formatCurrency = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceInput = (e) => {
    const inputPrice = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(inputPrice, 10);

    if (!isNaN(numericValue) && numericValue <= 100000000) {
      setPrice(formatCurrency(inputPrice));
    } else {
      setErrorMessage("Vui lòng số tiền dưới 100.000.000 VNĐ");
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setNameError(false);
    setDescriptionError(false);

    const trimInput = (value) => value.trim();

    if (!title || !description) {
      setNameError(!title);
      setDescriptionError(!description);
      setErrorMessage("Vui lòng nhập hết các trường.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      if (selectedImage) {
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

        if (!isNaN(parsedPrice) && !isNaN(parsedDiscountCode)) {
          const promotionalPrice = parsedPrice * (1 - parsedDiscountCode / 100);

          const fieldsToUpdate = {
            title: trimInput(document.getElementById("courseName").value),
            price: parsedPrice,
            sold: parsedDiscountCode,
            promotional_price: promotionalPrice,
            description: trimInput(
              document.getElementById("description").value
            ),
            introduce: editorRef.current.getContent(),
            active: true,
            image: imageUrl,
            categoryId: parseInt(selectedCategory, 10),
          };

          const response = await axiosClient.patch(
            `/courses/${id}`,
            fieldsToUpdate
          );

          if (response.status === 200) {
            setSuccessMessage("Khóa học đã được cập nhật thành công");
          } else {
            setErrorMessage("Không thể cập nhật khóa học");
          }
        } else {
          setErrorMessage("Giá tiền hoặc mã giảm giá không hợp lệ.");
        }
      } else {
        const parsedPrice = parseFloat(price.replace(/\./g, ""));
        const parsedDiscountCode = parseFloat(discountCode);

        if (!isNaN(parsedPrice) && !isNaN(parsedDiscountCode)) {
          

          const fieldsToUpdate = {
            title: trimInput(document.getElementById("courseName").value),
            
            sold: parsedDiscountCode,
            
            description: trimInput(
              document.getElementById("description").value
            ),
            introduce: editorRef.current.getContent(),
            active: true,
            categoryId: parseInt(selectedCategory, 10),
          };

          const response = await axiosClient.patch(
            `/courses/${id}`,
            fieldsToUpdate
          );

          if (response.status === 200) {
            setSuccessMessage("Khóa học đã được cập nhật thành công");
          } else {
            setErrorMessage("Không thể cập nhật khóa học");
          }
        } else {
          setErrorMessage("Giá tiền hoặc mã giảm giá không hợp lệ.");
        }
      }
    } catch (uploadError) {
      console.error("Lỗi tải ảnh:", uploadError);
      setErrorMessage("Vui lòng kiểm tra lại");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(e.target.files[0]);
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handleEditorChange = (content, editor) => {
    if (editorRef.current && content !== editorRef.current.getContent()) {
      setIntroduce(content);
    }
  };
  const [notification, setNotification] = useState(null);
  //check các điều kiện gửi yêu cầu
  const [isRequest, setIsRequest] = useState(false);
  const [isRequestCourseInfo, setIsRequestCourseInfo] = useState(false);
  const [isRequestCourseBenefit, setIsRequestCourseBenefit] = useState(false);
  const [isRequestVideo, setIsRequestVideo] = useState(false);
  const [textButtonRequest, setTextButtonRequest] = useState("Gửi yêu cầu");
  const [lengthProperities, setLengthProperities] = useState(0);
  const checkRequest = async () => {
    try {
      // Sử dụng Promise.all để thực hiện các yêu cầu API đồng thời
      const [responseCourseInfo, responseCourseBenefit, responseVideo] = await Promise.all([
        axiosClient.get(`courses/${id}`),
        axiosClient.get(`course_overview/course=${id}`),
        axiosClient.get(`videos/course=${id}`)        
      ]);
      let length = 0;
      // Xử lý responseCourseInfo
      if (responseCourseInfo.status === 200) {
        setIsRequestCourseInfo(true);
        length += 1;
      } else {
        setIsRequestCourseInfo(false);
      }
      const filteredDocuments = responseCourseBenefit.data.filter(
        (document) => document.isDeleted !== true
      );
      // Xử lý responseCourseBenefit
      if (filteredDocuments.length > 0) {
        setIsRequestCourseBenefit(true);
        length += 1;
      } else {
        setIsRequestCourseBenefit(false);
      }
  
      // Xử lý responseVideo
      if (responseVideo.data.length > 0) {
        setIsRequestVideo(true);
        length += 1;
      } else {
        setIsRequestVideo(false);
      }
      setLengthProperities(length);
      // Kiểm tra tất cả các điều kiện và cập nhật isRequest
      
      let properities = responseCourseInfo.status === 200 && filteredDocuments.length > 0 && responseVideo.data.length > 0;
      
      const courseInfo = responseCourseInfo.data;
      let no_request = courseInfo.isDeleted === true && courseInfo.active === false;
      let yes_request = courseInfo.isDeleted === false && courseInfo.active === false;
      let yes_public = courseInfo.isDeleted === false && courseInfo.active === true;
      
      if (properities){
        if(no_request){
          setIsRequest(true);
          setTextButtonRequest("Gửi yêu cầu");
        }
        if(yes_request){
          setIsRequest(false);
          setTextButtonRequest("Đã gửi yêu cầu");
        }
        if(yes_public){
          setIsRequest(false);
          setTextButtonRequest("Đã public");
        }
      } else {
        setIsRequest(false);
        setTextButtonRequest("Gửi yêu cầu");
      }

      console.log("properities:", properities);
      console.log("no_request:", no_request);
      console.log("yes_request:", yes_request);
      console.log("yes_public:", yes_public);
      
    } catch (error) {
      console.error("Error fetching request data:", error);
    }
  }

  const sendRequest = async () => {
    try {
      
      setLoading(true);
      const response = await axiosClient.patch(`/courses/${id}`, {
        isDeleted: false,
      });
      if (response.status === 200) {
       checkRequest();
       setNotification({
        type: "success",
        message: "Bạn đã gửi yêu cầu thành công!",
       });       
   
       setTimeout(() => {
        setNotification(null);
       }, 5000);
      }
      setLoading(false);
     } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
      setNotification({ type: "error", message: "Lỗi!" });
      setTimeout(() => {
       setNotification(null);
      }, 5000);      
     }
  }
  
  

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-8 col-lg-8 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <div className="container">
                  <h2 className="my-4">Chỉnh sửa thông tin khóa học</h2>
                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  {loading && (
                    <div className="alert alert-info" role="alert">
                      Đang cập nhật, vui lòng đợi...
                    </div>
                  )}
                  {notification && (
                      <div className={`notification ${notification.type}`}>
                        {notification.message}
                      </div>
                    )}
                  <form onSubmit={handleFormSubmit}>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label
                          htmlFor="courseName"
                          className="form-label fw-bold"
                        >
                          Tên khóa học
                        </label>
                        <input
                          type="text"
                          id="courseName"
                          className={`form-control ${
                            nameError ? "is-invalid" : ""
                          }`}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="col-5 mb-3">
                        <label
                          htmlFor="category"
                          className="form-label fw-bold"
                        >
                          Danh mục
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
                        <div>
                          <img
                            className="card-img-top p-0 pe-0"
                            alt="..."
                            src={image}
                            style={{ width: "100wh", height: "120px" }}
                          />
                        </div>
                        <input
                          type="file"
                          className="form-control"
                          id="upload"
                          accept="image/png, image/jpeg, image/gif"
                          // onChange={(e) => {setSelectedImage(e.target.files[0]); handleImageChange();}}
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
                      <textarea
                        id="description"
                        rows="4"
                        className={`form-control ${
                          nameError ? "is-invalid" : ""
                        }`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="introduce" className="form-label fw-bold">
                        Giới thiệu *
                      </label>
                      {/* <textarea
                        className="form-control"
                        id="introduce"
                        rows="4"
                        value={introduce}
                        onChange={handleChangeIntroduce}
                      ></textarea> */}
                      <Editor
                        apiKey="fdzsrqptrthigulkcrque8fvlzm6vaoxf8l7ujy4q4269zrm"
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        initialValue={introduce}
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
                                        

                    <button type="submit" className="btn btn-primary">
                      {loading ? "Đang tải..." : "Cập nhật khóa học"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-6 col-lg-4">
            {/* Thay đổi từ col-lg-3 thành col-lg-6 */}
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body">
                <h5 className="card-title text-center fw-bold">
                  Đã hoàn thành ({lengthProperities}/3)
                </h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item ">
                    {isRequestCourseInfo ? <FontAwesomeIcon
                      icon={faCheckSquare}
                      color="gray"
                      size="lg"
                    />: <FontAwesomeIcon
                    icon={faSquare}
                    color="gray"
                    size="lg"
                  />}
                    
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-course/${id}`}
                      className="fw-bold text-decoration-none text-dark"
                    >
                      Thông tin cơ bản (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                  {isRequestCourseBenefit ? <FontAwesomeIcon
                      icon={faCheckSquare}
                      color="gray"
                      size="lg"
                    />: <FontAwesomeIcon
                    icon={faSquare}
                    color="gray"
                    size="lg"
                  />}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-course-benefit/${id}`}
                      className="text-decoration-none  text-dark"
                    >
                      Tóm tắt nội dung của khóa học (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                  {isRequestVideo ? <FontAwesomeIcon
                      icon={faCheckSquare}
                      color="gray"
                      size="lg"
                    />: <FontAwesomeIcon
                    icon={faSquare}
                    color="gray"
                    size="lg"
                  />}
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-lession/${id}`}
                      className=" text-decoration-none text-dark"
                    >
                      Danh sách bài học (bắt buộc)
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <FontAwesomeIcon icon={faSquare} color="white" size="lg" />
                    &nbsp;
                    <Link
                      to={`/teacher/course/new-exam/${id}`}
                      className=" text-decoration-none text-dark"
                    >
                      Bài kiểm tra
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <FontAwesomeIcon icon={faSquare} color="white" size="lg" />
                    &nbsp;
                    <Link
                      to={`/teacher/course/edit-document/${id}`}
                      className=" text-decoration-none text-dark"
                    >
                      Tài liệu
                    </Link>
                  </li>
                </ul>
                
                <div className="d-flex justify-content-center align-items-center">
                  <button className="btn btn-primary" onClick={()=> sendRequest()} disabled={!isRequest}>
                  <p className="fw-bold py-0 my-0">{textButtonRequest}</p>
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
