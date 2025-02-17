import Header from "../Header/Header";
import Footer from "../Footer/Footer";

export default function ActivateCoursePage () {   
   
  return (
    <div>
     <Header/> 
    
     <div className="container">
      <div className="py-5 text-center">
        <h2>Kích hoạt khóa học</h2>
        <p className="lead">
          Lưu ý mỗi khóa học chỉ cần kích hoạt 1 lần duy nhất.
        </p>
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <div className="input-group mb-3">
              <input type="text" className="form-control" placeholder="Nhập mã khóa học" />
              <div className="input-group-append">
                <button className="btn btn-primary">Kích hoạt ngay</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 offset-lg-3">
          <div className="card">
            <div className="card-body">
              <p className="card-text">
                Nếu bạn muốn hỗ trợ thì vui lòng gọi tới số điện thoại: <a href="tel:0708128879">0708128879</a> hoặc email <a href="mailto:20110576@student.hcmute.edu.vn">20110576@student.hcmute.edu.vn</a> để được hỗ trợ!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer/>
    </div> 
  );
}

