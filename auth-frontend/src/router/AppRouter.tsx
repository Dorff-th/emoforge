// src/router/AppRouter.tsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { fetchProfile } from "@/store/slices/authSlice";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";

export default function AppRouter() {

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile()); // ✅ 최초 실행 시 /api/auth/me 호출
  }, [dispatch]);


  console.log(isAuthenticated);

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile" />}
        />

        {/* 프로필 페이지 (로그인 필요) */}
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* 기본 라우팅 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
