// src/store/slices/toastSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text: string;
   duration: number; // ✅ 새로 추가
}

interface ToastState {
  messages: ToastMessage[];
}

const initialState: ToastState = {
  messages: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (
      state,
      action: PayloadAction<{ type: "success" | "error" | "info" | "warning"; text: string; duration?: number; }>
    ) => {
      state.messages.push({
        id: Date.now().toString(),
        type: action.payload.type,
        text: action.payload.text,
        duration: action.payload.duration ?? 3000, // default duration (e.g., 3000ms)
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
