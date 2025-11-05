import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import UiTestPage from "@/pages/UiTestPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminMemberPage from "@/pages/AdminMemberPage";

export default function AppRouter() {


  return (
    <BrowserRouter>
      <ConfirmDialogProvider>
        <Routes>
          <Route path="/ui-test" element={<UiTestPage />} />
          {/* 관리자 로그인 */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* <Route path="/admin/dashboard" element={<AdminDashboardPage />} /> */}

           {/* 관리자 보호 라우트 */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
        >
        <Route index element={<Navigate to="dashboard" />} /> {/* ✅ 기본 이동 */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="members" element={<AdminMemberPage />} />
      </Route>

      {/* 기본 리다이렉트 */}
      <Route path="*" element={<Navigate to="/admin/login" />} />

          {/* 기본 리다이렉트 */}
          <Route path="*" element={<Navigate to="/admin/login" />} />
        </Routes>
      </ConfirmDialogProvider>
    </BrowserRouter>
  );
}


