import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosAuth from "@/api/axiosAuth";

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    
    try {
      const res = await axiosAuth.get("/auth/me", {});
      return res.data;
    } catch (err: any) {
      
      if (err.response?.status === 403) {
        return rejectWithValue("unauthenticated");
      }
      return rejectWithValue("error");
    }
  }
);

// ✅ 로그아웃(쿠키 삭제) + 상태 초기화
export const logoutThunk = createAsyncThunk<void>("auth/logout", async () => {
  await axiosAuth.post("/auth/logout", {}); // 204 기대
});

interface AuthState {
  user: any | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        if (action.payload === "unauthenticated") {
          state.status = "unauthenticated";
        } else {
          state.status = "error";
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
