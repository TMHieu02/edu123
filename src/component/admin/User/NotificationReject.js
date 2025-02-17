import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient'; // assuming you have a client set up
import { useNavigate} from "react-router-dom";
import "./upgrade-to-teacher.css";
import Header from "../Header/Header";

export default function NotificationReject() {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const { email } = useParams();
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const response =  axiosClient.patch(`/users/${id}`, {
      roleId: 1,
      introduce: '',
      description: '',
    });

    axiosClient.post(`/auth/send/message/${email}`, {
      message: message,
    })
    .then(response => {
      console.log(response);
      setIsLoading(false);
      setNotification({
        type: "success",
        message: "Đã từ chối người dùng thành công!",
      });
      setTimeout(() => {
      navigate('/admin/upgrade-to-teacher'); 
      }, 3000);
    })
    .catch(error => {
      console.error(error);
    });
  };

  return (
    <div>
       <div className="manager-user-layout">
      <aside className="sidebar">
        <Header />
      </aside>
      <main className="manager-user-main-content col-md-8">
      <div className="container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-9 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h2 className="card-title text-center mb-5  fw-bold ">Lý do từ chối</h2>
                <form onSubmit={handleFormSubmit}>                  
                  <div className="form-outline mb-4">
                    <textarea
                      className="form-control"
                      placeholder="Lý do"
                      value={message}
                      onChange={handleMessageChange}
                    />
                  </div>
                  <div className="form-outline mb-4">
                      {isLoading ? (
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      {notification && (
                        <div className={`notification ${notification.type}`}>
                          {notification.message}
                        </div>
                      )}
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
        </div>
      </div>
      </main>
      </div>
    </div>
  );
}