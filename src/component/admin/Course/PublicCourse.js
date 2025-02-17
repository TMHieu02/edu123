
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faEdit, faTrash, faFile } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";



export default function PublicCourse() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };
  return (
    <div>
      
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-7 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">

              <div className="container">
                  {/* List of documents */}
                  <div className="card mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 d-inline-block">Danh sách yêu cầu public khóa học</h5>                      
                      
                    </div>

                    <div className="card-body">
                      <div className="row">
                                                
                          
                            <div>
                              <p className="d-inline-block float-lg-start"><strong>Khóa học luyện gõ 10 ngón tay</strong></p>                              
                              <button
                                className="btn btn-primary btn-sm margin-button-header d-inline-block float-end"
                                onClick={() => handleNavigate("/admin/public-course/course-info")}
                              >
                                <FontAwesomeIcon icon={faCircleInfo} /> Chi tiết
                              </button>                             
                            </div>
                            
                          
                        

                        
                      </div>
                      {/* Additional documents */}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-3 col-lg-3">
            <div className="card border-0 shadow rounded-3 my-5">
 
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );
}