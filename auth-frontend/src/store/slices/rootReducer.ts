// src/store/slices/index.ts
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  // 추후 다른 slice도 추가 가능
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
