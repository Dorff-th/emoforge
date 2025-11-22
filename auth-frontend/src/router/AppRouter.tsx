import {  Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import UiTestPage from "@/pages/UiTestPage";
import TestPage from "@/pages/TestPage";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import WithdrawalPendingPage from "@/pages/WithdrawalPendingPage";
import KakaoCallbackPage from "@/pages/auth/KakaoCallbackPage";
import TermsAgreementPage from "@/pages/auth/TermsAgreementPage";
import PrivateRoute from "@/private/PrivateRoute";

export default function AppRouter() {
  const { status } = useAppSelector((state) => state.auth);

  return (
    <ConfirmDialogProvider>
      <Routes>

        {/* Index 루트 */}
        <Route
          index
          element={
            status === "authenticated" ? (
              <Navigate to="/profile" replace />
            ) : status === "deleted" ? (
              <Navigate to="/withdraw/pending" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ui-test" element={<UiTestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/auth/terms" element={<TermsAgreementPage />} />
        <Route path="/withdraw/pending" element={<WithdrawalPendingPage />} />

        {/* Protected Route (로그인 필요) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <ProfilePage />
              </AuthenticatedLayout>
            </PrivateRoute>
          }
        />

      </Routes>
    </ConfirmDialogProvider>
  );
}

