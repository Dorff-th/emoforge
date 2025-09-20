import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import UiTestPage from "@/pages/UiTestPage";
//import HomePage from "@/pages/HomePage";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";

export default function AppRouter() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);

  //최초에만 프로필 요청 (루프 방지)
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  // 로딩 중이면 스피너
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
    <ConfirmDialogProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ui-test" element={<UiTestPage />} />

        <Route path="/profile" element={<ProfilePage />} />

        {status === "authenticated" && (
          <>
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* fallback: 아직 상태 결정 안 됐으면 로딩 */}
        {status === "idle" && (
          <Route path="*" element={<div>Loading...</div>} />
        )}
      </Routes>
      </ConfirmDialogProvider>
    </BrowserRouter>
  );
}
