// src/store/slices/toastSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text: string;
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
      action: PayloadAction<{ type: "success" | "error" | "info" | "warning"; text: string }>
    ) => {
      state.messages.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
