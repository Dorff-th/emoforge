// store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async () => {
  const res = await axiosInstance.get("/auth/me"); // ✅ 쿠키 자동 포함
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { isAuthenticated: false, user: null as any },
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
