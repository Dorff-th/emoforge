import { useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import UiTestPage from "@/pages/UiTestPage";
import TestPage from "@/pages/TestPage";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import WithdrawalPendingPage from "@/pages/WithdrawalPendingPage";

export default function AppRouter() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === "authenticated";

  // 최초 프로필 조회
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  // status 변화에 따른 자동 라우팅
  useEffect(() => {
    if (status === "authenticated") navigate("/profile");
    else if (status === "deleted") navigate("/withdraw/pending");
    else if (status === "unauthenticated") navigate("/login");
  }, [status, navigate]);

  return (
    <ConfirmDialogProvider>
      <Routes>

        {/* Root */}
        <Route
          path="/"
          element={
            status === "deleted" ? (
              <Navigate to="/withdraw/pending" replace />
            ) : isAuthenticated ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/ui-test" element={<UiTestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/withdraw/pending" element={<WithdrawalPendingPage />} />

        <Route
          path="/profile"
          element={
            status === "deleted" ? (
              <Navigate to="/withdraw/pending" replace />
            ) : status === "authenticated" ? (
              <AuthenticatedLayout>
                <ProfilePage />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Routes>
    </ConfirmDialogProvider>
  );
}
