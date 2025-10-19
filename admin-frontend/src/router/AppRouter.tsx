import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import UiTestPage from "@/pages/UiTestPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";

export default function AppRouter() {


  return (
    <BrowserRouter>
      <ConfirmDialogProvider>
        <Routes>
          <Route path="/ui-test" element={<UiTestPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </ConfirmDialogProvider>
    </BrowserRouter>
  );
}


