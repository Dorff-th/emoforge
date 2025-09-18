// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk  } from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

type User = {
  nickname: string;
  email: string;
  profileUrl?: string | null;
};

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  initialized: boolean; // ✅ 앱 부팅 후 최초 프로필 확인이 끝났는가
  error?: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  initialized: false,
  error: null,
};

// ✅ 쿠키 기반 프로필 조회 (401이면 실패)
export const fetchProfile = createAsyncThunk<User>(
  "auth/fetchProfile",
  async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  }
);

// ✅ 로그아웃(쿠키 삭제) + 상태 초기화
export const logoutThunk = createAsyncThunk<void>("auth/logout", async () => {
  await axiosInstance.post("/auth/logout", {}); // 204 기대
});

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    resetAuth: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.initialized = true; // 부팅 이후엔 true로 둬야 가드가 로딩에 안걸림
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.initialized = true; // ✅ 최초 부팅 완료
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.initialized = true; // ✅ 실패해도 “초기화 완료”로 바꿔서 루프 차단
        state.error = action.error.message ?? null;
      })
      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.initialized = true;
      });
  },
});

export const { setUser, resetAuth } = slice.actions;
export default slice.reducer;
