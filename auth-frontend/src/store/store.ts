// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import loadingReducer from "./slices/loadingSlice";
import toastReducer from "./slices/toastSlice";
import termsReducer from "@/store/slices/termsSlice";   // ← 추가

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer, // ✅ 추가
    toast: toastReducer, // ✅ 추가
    terms: termsReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
