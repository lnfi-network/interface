import { configureStore } from "@reduxjs/toolkit";
import relayReducer from "./reducer/relayReducer";
import userReducer from "./reducer/userReducer";
import modalReducer from "./reducer/modalReducer";
import marketReducer from "./reducer/marketReducer";
const store = configureStore({
  reducer: {
    basic: relayReducer,
    user: userReducer,
    modal: modalReducer,
    market: marketReducer
  }
});
export default store;
