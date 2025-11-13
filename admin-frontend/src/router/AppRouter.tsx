import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import UiTestPage from "@/pages/UiTestPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminMemberPage from "@/pages/AdminMemberPage";
import AdminCategoryPage from "@/pages/AdminCategoryPage";
import AdminNotFound from "@/pages/AdminNotFound";

export default function AppRouter() {


  return (
    <BrowserRouter>
      <ConfirmDialogProvider>
        <Routes>
          <Route path="/ui-test" element={<UiTestPage />} />
          {/* 관리자 로그인 */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

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
            <Route path="posts/category" element={<AdminCategoryPage />} />
        </Route>
          {/* 관리자 화면 전용 404 */}
          <Route path="*" element={<AdminNotFound />} />
        </Routes>
      </ConfirmDialogProvider>
    </BrowserRouter>
  );
}


