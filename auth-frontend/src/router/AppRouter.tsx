// src/AppRouter.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchProfile } from "@/store/slices/authSlice";
import { RequireAuth, RequireGuest } from "@/router/guards";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";

export default function AppRouter() {
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useSelector((s: RootState) => s.auth.initialized);

  useEffect(() => {
    // ✅ 앱 부팅 시 한 번만 프로필 확인
    if (!initialized) {
      dispatch(fetchProfile());
    }
  }, [dispatch, initialized]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 게스트 전용 (로그인 안된 상태만 접근) */}
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 인증 필요 */}
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 기본 라우트 */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
