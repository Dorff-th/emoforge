// src/routes/guards.tsx
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Navigate, Outlet } from "react-router-dom";

// 로그인이 필요한 페이지 보호
export function RequireAuth() {
  const { user, initialized, status } = useSelector((s: RootState) => s.auth);

  // 아직 초기화 전이면 깜빡임/루프 방지용 로딩
  if (!initialized || status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }
  // 초기화 완료 + 사용자 없음 → 로그인으로
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// 로그인 상태에선 /login 못 가게 (자동 /profile)
export function RequireGuest() {
  const { user, initialized, status } = useSelector((s: RootState) => s.auth);
  if (!initialized || status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (user) return <Navigate to="/profile" replace />;
  return <Outlet />;
}
