import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // ✅ 최신 방식
import type { JSX } from "react";

interface DecodedToken {
  role?: string;
  exp?: number;
  [key: string]: any;
}

export default function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const token = Cookies.get("admin_token");


  if (!token) return <Navigate to="/admin/login" replace />;

  try {
    const decoded: DecodedToken = jwtDecode(token);

    if (decoded.role !== "ADMIN") throw new Error("Not admin");

    // 만료 체크 (선택사항)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      Cookies.remove("admin_token");
      return <Navigate to="/admin/login" replace />;
    }

    return children;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }
}
