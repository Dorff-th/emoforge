import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
  duration: number; // ✅ 새로 추가
}

const initialState: ToastState = {
  message: '',
  type: 'info',
  visible: false,
  duration: 3000, // 기본 3초
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
        duration?: number; // ✅ 선택적
      }>,
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.visible = true;
      state.duration = action.payload.duration ?? 3000; // 기본값 3초
    },
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
