import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import UiTestPage from "@/pages/UiTestPage";
import TestPage from "@/pages/TestPage";
//import HomePage from "@/pages/HomePage";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";

export default function AppRouter() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === "authenticated";

  // Fetch profile only once on first load (avoid loop)
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  // Show loading indicator while fetching
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <ConfirmDialogProvider>
        <Routes>
          <Route
            path="/"
            element={
              status === "authenticated" || status === "unauthenticated" ? (
                <Navigate to={isAuthenticated ? "/profile" : "/login"} replace />
              ) : (
                <div>Loading...</div>
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ui-test" element={<UiTestPage />} />
          <Route path="/test" element={<TestPage />} />

          <Route
            path="/profile"
            element={
              status === "authenticated" ? (
                <ProfilePage />
              ) : status === "idle" ? (
                <div>Loading...</div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {isAuthenticated && (
            <>
              {/* <Route path="/" element={<HomePage />} /> */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* fallback: show loading until auth status resolves */}
          {status === "idle" && (
            <Route path="*" element={<div>Loading...</div>} />
          )}
        </Routes>
      </ConfirmDialogProvider>
    </BrowserRouter>
  );
}


