// src/store/slices/termsSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface TermsState {
  open: boolean;       // 약관 모달 or 약관 페이지 접근 여부
  kakaoId: string;     // 신규가입 판별 + 가입 API에서 반드시 필요
  nickname: string;    // 초기 닉네임(카카오에서 받아옴), 변경 가능
}

const initialState: TermsState = {
  open: false,
  kakaoId: "",
  nickname: "",
};

const termsSlice = createSlice({
  name: "terms",
  initialState,
  reducers: {
    openTermsModal: (state, action) => {
      state.open = true;
      state.kakaoId = action.payload.kakaoId;      // ⭐ 신규가입 판별의 핵심
      state.nickname = action.payload.nickname;    // UI·초기값 용도
    },

    closeTermsModal: (state) => {
      state.open = false;
      state.kakaoId = "";
      state.nickname = "";
    },
  },
});

export const { openTermsModal, closeTermsModal } = termsSlice.actions;
export default termsSlice.reducer;
