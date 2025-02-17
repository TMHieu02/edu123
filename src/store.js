import { configureStore } from '@reduxjs/toolkit';
import reviewReducer from './slices/reviewSlice';
import ratingReducer from './slices/ratingSlice';  
import categoryReducer from './slices/categorySlice';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import commentReducer from './slices/commentSlice';
import videoReducer from './slices/videoSlice';
import paymentReducer from './slices/paymentSlice';
import orderItemReducer from './slices/orderItemSlice';
import orderReducer from './slices/orderSlice';
import feedbackReducer from './slices/feedbackSlice';
import documentReducer from './slices/documentSlice';
import courseRegisterReducer from './slices/courseRegisterSlice';
import courseReducer from './slices/courseSlice';
import idReducer from './slices/idSlice'


const store = configureStore({
  reducer: {
    review: reviewReducer,
    rating: ratingReducer,
    category: categoryReducer,
    auth: authReducer,
    cart: cartReducer,
    comment: commentReducer,
    video: videoReducer,
    payment: paymentReducer,
    orderItem: orderItemReducer,
    order: orderReducer,
    feedback: feedbackReducer,
    document: documentReducer,
    courseRegister: courseRegisterReducer,
    course: courseReducer,
    id: idReducer

  }
});

export default store;
