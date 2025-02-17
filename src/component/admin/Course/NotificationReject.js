import PublicCoursePanel from "./PublicCoursePanel";
import Header from '../Header/Header';



export default function NotificationReject() {
  
  return (
    <div>
      <Header/>
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-7 mx-auto">
          <div className="card border-0 shadow rounded-3 my-5">
          <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5  fw-bold ">
                  Lý do từ chối{" "}
                </h2>
                <form action="/login" method="POST">                  

                  <div className="form-outline mb-4">
                    <textarea
                      type="phone"
                      className="form-control"
                      placeholder="Lý do"
                      name="password"
                      id="password"
                    />
                  </div>
                  

                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4 w-100 "
                  >
                    Gửi
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            <div className="bg-white" id="panel">
              <PublicCoursePanel/> {/* panel component */}
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );
}