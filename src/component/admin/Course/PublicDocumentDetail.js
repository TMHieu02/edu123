
import PublicCoursePanel from "./PublicCoursePanel";




export default function PublicDocumentDetail() {
 

  
  return (
    <div>
      
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9 col-lg-7 mx-auto">
          <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5  fw-bold ">
                  Tải lên tài liệu tham khảo
                </h2>

                <div className="container">
                  <h2 className="my-4">Nhập thông tin tài liệu</h2>
                  <form>
                    {/* Nhập đường dẫn của tài liệu tham khảo */}
                    <div className="mb-3">
                      <label htmlFor="documentLink" className="form-label fw-bold">Đường dẫn của tài liệu tham khảo</label>
                      <input type="text" className="form-control" id="documentLink" />
                    </div>

                    {/* Tiêu đề tài liệu */}
                    <div className="mb-3">
                      <label htmlFor="documentTitle" className="form-label fw-bold">Tiêu đề tài liệu</label>
                      <input type="text" className="form-control" id="documentTitle" />
                    </div>

                    {/* Tải hình ảnh lên */}
                    <div className="mb-3">
                      <label htmlFor="uploadImage" className="form-label fw-bold">Tải hình ảnh lên</label>
                      <input type="file" className="form-control" id="uploadImage" accept="image/*" />
                    </div>

                    
                  </form>
                </div>


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