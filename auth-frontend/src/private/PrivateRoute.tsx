import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import StateLoading from "@/components/common/StateLoading";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);

  // ❗fetchProfile()는 렌더링 이후에만 실행해야 함
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProfile());
    }
  }, [status, dispatch]);

  // 🔥 절대 렌더링 중 dispatch() 호출 금지
  if (status === "idle" || status === "loading") {
    return <StateLoading />;
  }

  // refresh_token이 있으면 interceptor가 재발급을 시도하게 해야 함
  if (status === "unauthenticated") {
    const hasRefresh = document.cookie.includes("refresh_token=");
    if (!hasRefresh) {
      return <Navigate to="/login" replace />;
    }
    // refresh_token 있으므로 렌더링 시도 (API 요청 → 401 → refresh 로직)
  }

  if (status === "deleted") {
    return <Navigate to="/withdraw/pending" replace />;
  }

  return children;
}
