import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
//import UiTestPage from "@/pages/UiTestPage";
import TestPage from "@/pages/TestPage";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import WithdrawalPendingPage from "@/pages/WithdrawalPendingPage";
import KakaoCallbackPage from "@/pages/auth/KakaoCallbackPage";
import TermsAgreementPage from "@/pages/auth/TermsAgreementPage";
import PrivateRoute from "@/private/PrivateRoute";
import { fetchProfile as fetchProfileThunk } from "@/store/slices/authSlice";
import PublicLayout from "@/components/layout/PublicLayout";
import AboutLayout from "@/components/layout/AboutLayout";
import AboutEmoforgePage from "@/pages/about/emoforge/AboutEmoforgePage";
import AboutIntroPage from "@/pages/about/intro/AboutIntroPage";

export default function AppRouter() {
  const { status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  //인증 확인 thunk는 App 진입 시 1회 실행
  useEffect(() => {
    dispatch(fetchProfileThunk());
  }, []);

  return (
    <ConfirmDialogProvider>
      <Routes>
        {/* Index 루트 */}
        <Route
          index
          element={
            status === "idle" || status === "loading" ? (
              <div /> // or Splash / Loader
            ) : status === "authenticated" ? (
              <Navigate to="/profile" replace />
            ) : status === "deleted" ? (
              <Navigate to="/withdraw/pending" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes */}

        <Route path="/test" element={<TestPage />} />
        <Route path="/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/auth/terms" element={<TermsAgreementPage />} />
        <Route path="/withdraw/pending" element={<WithdrawalPendingPage />} />

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<AboutLayout />}>
          <Route path="/about/emoforge" element={<AboutEmoforgePage />} />
          <Route path="/about/intro" element={<AboutIntroPage />} />
        </Route>

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
