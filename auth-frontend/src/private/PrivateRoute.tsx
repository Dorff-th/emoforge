import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { startLoading } from "@/store/slices/loadingSlice";

export default function PrivateRoute({ children }: { children: ReactNode  }) {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);

  // 로그인 필요 페이지에서만 프로필 조회
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProfile());
    }
  }, [status, dispatch]);

  if (status === "idle" || status === "loading") {
    dispatch(startLoading());
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "deleted") {
    return <Navigate to="/withdraw/pending" replace />;
  }

  // 인증 완료된 경우만 children 표시
  return children;
}
