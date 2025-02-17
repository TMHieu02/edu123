import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { UserProvider } from "./provider/UserProvider.js";

import HomePage from "./component/user/Home/HomePage.js";
import Login from "./component/Login/Login";
import Register from "./component/Register/Register.js";
import ForgetPassword from "./component/user/MyProfile/ForgetPassword";
import TeacherDetail from "./component/user/Teacher/TeacherDetail.js";
import CourseDetail from "./component/user/Course/CourseDetail.jsx";
import EditProfile from "./component/user/MyProfile/EditProfile.js";
import ChangePassword from "./component/user/MyProfile/ChangePassword.js";
import RegisterTeacher from "./component/user/Teacher/RegisterTeacher.js";
import EditInfoTeacher from "./component/user/Teacher/EditInformation.js";
import PaymentInformation from "./component/user/Teacher/PaymentInformation.js";
import Cart from "./component/user/Cart/Cart.js";
import Search from "./component/user/Search/Search.jsx";
import Category from "./component/user/Category/Category.jsx";
import Order from "./component/user/Order/Order.js";
import DashboardTeacher from "./component/user/DashboardTeacher/Dashboard.js";
import NewCourseProcess from "./component/user/NewCourse/NewCourseProcess.js";
import NewCourse from "./component/user/NewCourse/NewCourse.js";
import Dashboard from "./component/user/Dashboard/Dashboard.js";
import Study from "./component/user/Study/Study.jsx";
import CourseStudyNew from "./component/user/Study/CourseStudy.jsx";
import CourseStudyNetworkSupport from "./component/user/Study/CourseStudyNetworkSupport.jsx";

import ActivateCoursePage from "./component/user/Course/ActivateCoursePage.js";
import HistoryOrder from "./component/user/Dashboard/History.js";
import NewVideo from "./component/user/Video/NewVideo.js";
import EditVideo from "./component/user/Video/EditVideo.js";

import EditCourse from "./component/user/Course/EditCourse.js";
import EditDocument from "./component/user/Document/EditDocument.js";
import CourseBenefit from "./component/user/CourseBenefit/CourseBenefit.jsx";
import Statics from "./component/user/DashboardTeacher/Statics.js";

import EditLession from "./component/user/Lession/EditLession.js";
import WatchVideo from "./component/user/Video/WatchVideo.js";
import UpgradeToTeacher from "./component/admin/User/UpgradeToTeacher.js";
import ToTeacherDetail from "./component/admin/User/ToTeacherDetail.js";
import NotificationReject from "./component/admin/User/NotificationReject.js";
import PublicCourse from "./component/admin/Course/PublicCourse.js";
import CourseInfo from "./component/admin/Course/CourseInfo.js";
import PublicLession from "./component/admin/Course/PublicLession.js";
import PublicLessionDetail from "./component/admin/Course/PublicLessionDetail.js";
import PublicDocument from "./component/admin/Course/PublicDocument.js";
import PublicDocumentDetail from "./component/admin/Course/PublicDocumentDetail.js";
import Summary from "./component/admin/Course/Summary.js";
import NotificationRejectCourse from "./component/admin/Course/NotificationReject.js";
import PaymentConfirm from "./component/admin/PaymentConfirm/PaymentConfirm.js";
import CourseStudy from "./component/user/Course/CourseStudy.js";
import FeedBack from "./component/user/Feedback/Feedback.js";
import ManagerlUser from "./component/admin/User/ManagerUser.js";
import UserInfo from "./component/admin/User/UserInfo.js";
import ManagerCourse from "./component/admin/Course/ManagerCourse.js";
import Admin from "./component/admin/Admin.js";
import ADay from "./component/admin/Analytics/ADay.js";
import WatchVideoAdmin from "./component/admin/Course/WatchVideo.js";
import VNPayReturnPage from "./component/user/VNPay/VNPayReturnPage.js";
import CourseApproval from "./component/admin/ManagerCourse/CourseApproval.jsx";
import CourseActive from "./component/admin/ManagerCourse/CourseActive.jsx";
import FeedbackAdmin from "./component/admin/Feedback/Feedback.jsx";

import NewExam from "./component/user/Exam/NewExam.js";
import ListExam from "./component/user/Exam/ListExam.js";
import EditExam from "./component/user/Exam/EditExam.js";
import ResultExam from "./component/user/Exam/ResultExam.js";
import TestExam from "./component/user/Exam/TestExam.js";
import NewQuestion from "./component/user/Question/NewQuestion.js";
import ListQuestion from "./component/user/Question/ListQuestion.js";
import SeeAnswer from "./component/user/Exam/SeeAnswer.js";

import PaymentControl from "./component/user/Payment/PaymentControl.js";
import PaymentTeacher from "./component/admin/PaymentTeacher/PaymentTeacher.js";
import CancelPayment from "./component/admin/PaymentTeacher/CancelPayment.js";

import NotFound from "./component/Others/NotFound";

import "bootstrap/dist/css/bootstrap.min.css";

import "./input.css";

const checkAccess = (requiredRoleId) => {
  const encodedRoleId = localStorage.getItem("roleId");
  const roleId = atob(encodedRoleId);

  if (requiredRoleId === "4") {
    // Nếu requiredRoleId là 4, kiểm tra xem roleId có phải là 1 không
    return roleId === "1";
  }

  // Cho các trường hợp khác, giữ nguyên logic cũ
  if (requiredRoleId === "1" && (roleId === "2" || roleId === "4")) {
    return true;
  }
  return roleId === requiredRoleId || roleId === "3";
};

const ProtectedRoute = ({ element, path, requiredRoleId }) => {
  const hasAccess = checkAccess(requiredRoleId);

  return hasAccess ? element : <Navigate to="/" />;
};

const storedRoleId = localStorage.getItem("roleId");
const { roleId } = storedRoleId ? JSON.parse(atob(storedRoleId)) : {};

const App = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Trang chung */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search/:title" element={<Search />} />
          <Route path="/payment/vnpay-return" element={<VNPayReturnPage />} />
          <Route path="/searchCategory/:categoryId" element={<Category />} />
          <Route
            path="/sortCourseInCategory/:categoryId/:sortName"
            element={<Category />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<ForgetPassword />} />

          <Route
            path="/user/course/activate"
            element={<ActivateCoursePage />}
          />
          <Route path="/user/order/history" element={<HistoryOrder />} />

          <Route
            path="/user/course/watch-video/:courseId/:id"
            element={<WatchVideo />}
          />
          <Route
            path="/admin/upgrade-to-teacher"
            element={<UpgradeToTeacher />}
          />
          <Route
            path="/admin/upgrade-to-teacher/detail/:id"
            element={<ToTeacherDetail />}
          />
          <Route
            path="/admin/upgrade-to-teacher/detail/reject"
            element={<NotificationReject />}
          />
          <Route path="/admin/public-course" element={<PublicCourse />} />
          <Route
            path="/admin/public-course/course-info"
            element={<CourseInfo />}
          />
          <Route
            path="/admin/public-course/lession"
            element={<PublicLession />}
          />
          <Route
            path="/admin/public-course/lession/detail"
            element={<PublicLessionDetail />}
          />
          <Route
            path="/admin/public-course/document"
            element={<PublicDocument />}
          />
          <Route
            path="/admin/public-course/document/detail"
            element={<PublicDocumentDetail />}
          />
          <Route path="/admin/public-course/summary" element={<Summary />} />
          <Route
            path="/admin/public-course/reject"
            element={<NotificationRejectCourse />}
          />
          <Route path="/admin/user-info/:id" element={<UserInfo />} />
          <Route path="/admin/payment-confirm" element={<PaymentConfirm />} />
          <Route path="/user/course/:id" element={<CourseDetail />} />

          {/* Trang học viên */}
          <Route
            path="/user"
            element={
              <ProtectedRoute element={<HomePage />} requiredRoleId="1" />
            }
          />
          <Route
            path="/user/dashboard"
            element={<ProtectedRoute element={<Study />} requiredRoleId="1" />}
          />

          <Route
            path="/user/course/study/:courseId"
            element={
              <ProtectedRoute element={<CourseStudyNew />} requiredRoleId="1" />
            }
          />

          <Route
            path="/user/course/study-network-support/:courseId"
            element={
              <ProtectedRoute
                element={<CourseStudyNetworkSupport />}
                requiredRoleId="1"
              />
            }
          />

          <Route
            path="/user/edit-info"
            element={
              <ProtectedRoute element={<EditProfile />} requiredRoleId="1" />
            }
          />
          <Route
            path="/user/change-password"
            element={
              <ProtectedRoute element={<ChangePassword />} requiredRoleId="1" />
            }
          />
          <Route
            path="/user/info-teacher/:id"
            element={
              <ProtectedRoute element={<TeacherDetail />} requiredRoleId="1" />
            }
          />

          <Route
            path="/user/cart"
            element={<ProtectedRoute element={<Cart />} requiredRoleId="1" />}
          />

          <Route
            path="/user/order/:courseId/:cartId/:otp"
            element={<ProtectedRoute element={<Order />} requiredRoleId="1" />}
          />

          <Route
            path="/user/register-teacher"
            element={
              <ProtectedRoute
                element={<RegisterTeacher />}
                requiredRoleId="1"
              />
            }
          />

          <Route
            path="/user/feedback"
            element={
              <ProtectedRoute element={<FeedBack />} requiredRoleId="1" />
            }
          />
          {/* Trang giảng viên */}
          <Route
            path="/user/payment-control"
            element={
              <ProtectedRoute element={<PaymentControl />} requiredRoleId="2" />
            }
          />

          <Route
            path="/teacher/infor-teacher"
            element={
              <ProtectedRoute element={<TeacherDetail />} requiredRoleId="2" />
            }
          />

          <Route
            path="/teacher/edit-info"
            element={
              <ProtectedRoute
                element={<EditInfoTeacher />}
                requiredRoleId="2"
              />
            }
          />
          <Route
            path="/teacher/statics"
            element={
              <ProtectedRoute element={<Statics />} requiredRoleId="2" />
            }
          />
          <Route
            path="/teacher/payment-info"
            element={
              <ProtectedRoute
                element={<PaymentInformation />}
                requiredRoleId="2"
              />
            }
          />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute
                element={<DashboardTeacher />}
                requiredRoleId="2"
              />
            }
          />
          <Route path="/teacher/course/new-exam/:id" element={<NewExam />} />
          <Route path="/teacher/course/edit-exam/:id" element={<EditExam />} />
          <Route path="/teacher/course/list-exam/:id" element={<ListExam />} />
          <Route path="/user/result-exam/:id" element={<ResultExam />} />
          <Route path="/user/start-exam/:id" element={<TestExam />} />
          <Route path="/user/see-answer/:id" element={<SeeAnswer />} />
          <Route
            path="/teacher/course/new-question/:id"
            element={<NewQuestion />}
          />
          <Route
            path="/teacher/course/exam/:id/question"
            element={<ListQuestion />}
          />

          <Route
            path="/teacher/course/edit-course/:id"
            element={
              <ProtectedRoute element={<EditCourse />} requiredRoleId="2" />
            }
          />
          <Route
            path="/teacher/course/new-course-process"
            element={
              <ProtectedRoute
                element={<NewCourseProcess />}
                requiredRoleId="2"
              />
            }
          />
          <Route
            path="/teacher/course/new-course"
            element={
              <ProtectedRoute element={<NewCourse />} requiredRoleId="2" />
            }
          />

          <Route
            path="/teacher/course/new-video/:id"
            element={
              <ProtectedRoute element={<NewVideo />} requiredRoleId="2" />
            }
          />
          <Route
            path="/teacher/course/edit-video/:id"
            element={
              <ProtectedRoute element={<EditVideo />} requiredRoleId="2" />
            }
          />

          <Route
            path="/teacher/course/edit-document/:id"
            element={
              <ProtectedRoute element={<EditDocument />} requiredRoleId="2" />
            }
          />

          <Route
            path="/teacher/course/edit-course-benefit/:id"
            element={
              <ProtectedRoute element={<CourseBenefit />} requiredRoleId="2" />
            }
          />

          <Route
            path="/teacher/course/edit-lession/:id"
            element={
              <ProtectedRoute element={<EditLession />} requiredRoleId="2" />
            }
          />

          {/* Trang admin */}
          <Route
            path="/admin"
            element={<ProtectedRoute element={<Admin />} requiredRoleId="3" />}
          />
          <Route
            path="/admin/payment-to-teacher"
            element={
              <ProtectedRoute element={<PaymentTeacher />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/upgrade-to-teacher"
            element={
              <ProtectedRoute
                element={<UpgradeToTeacher />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/upgrade-to-teacher/detail/:id"
            element={
              <ProtectedRoute
                element={<ToTeacherDetail />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/upgrade-to-teacher/detail/reject/:email/:id"
            element={
              <ProtectedRoute
                element={<NotificationReject />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/public-course"
            element={
              <ProtectedRoute element={<PublicCourse />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/public-course/course-info/:courseId"
            element={
              <ProtectedRoute element={<CourseInfo />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/public-course/lession"
            element={
              <ProtectedRoute element={<PublicLession />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/public-course/lession/detail"
            element={
              <ProtectedRoute
                element={<PublicLessionDetail />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/public-course/document"
            element={
              <ProtectedRoute element={<PublicDocument />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/public-course/document/detail"
            element={
              <ProtectedRoute
                element={<PublicDocumentDetail />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/public-course/summary"
            element={
              <ProtectedRoute element={<Summary />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/public-course/reject"
            element={
              <ProtectedRoute
                element={<NotificationRejectCourse />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/payment-confirm"
            element={
              <ProtectedRoute
                element={<PaymentConfirm />}
                requiredRoleId="3"
              />
            }
          />
          <Route
            path="/admin/manager-user"
            element={
              <ProtectedRoute element={<ManagerlUser />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/course-active"
            element={
              <ProtectedRoute element={<CourseActive />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/course-approval"
            element={
              <ProtectedRoute element={<CourseApproval />} requiredRoleId="3" />
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute element={<FeedbackAdmin />} requiredRoleId="3" />
            }
          />
          <Route path="/admin/analytics-aday" element={<ADay />} />
          <Route
            path="/admin/course/watch-video/:courseId/:id"
            element={
              <ProtectedRoute
                element={<WatchVideoAdmin />}
                requiredRoleId="3"
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default App;
