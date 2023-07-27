import { configureStore } from "@reduxjs/toolkit";
import basicReducer from "./reducer/basicReducer";
import userReducer from "./reducer/userReducer";
import modalReducer from "./reducer/modalReducer";
import marketReducer from "./reducer/marketReducer";
const store = configureStore({
  reducer: {
    basic: basicReducer,
    user: userReducer,
    modal: modalReducer,
    market: marketReducer
  }
});
export default store;
