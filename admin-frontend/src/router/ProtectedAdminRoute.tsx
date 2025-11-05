import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosAdmin from "@/api/axiosAdmin";
import type { JSX } from "react";

export default function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    //axios.get("https://www.emoforge.dev/api/auth/admin/me", { withCredentials: true })
      axiosAdmin
      .get("/admin/me", {}) // ✅ baseURL 자동 적용됨
      .then((res) => {
        //console.log("✅ 관리자 인증 성공:", res.data);
        console.log("✅ 관리자 인증 성공:");
        if (res.data.role === "ROLE_ADMIN") {
          setAuthorized(true);
        } else {
          console.warn("⚠️ ROLE_ADMIN 아님:");
          setAuthorized(false);
        }
      })
      .catch((err) => {
        console.error("❌ 관리자 인증 실패:", err);
        setAuthorized(false);
      });
  }, []);

  console.log("🔍 authorized 상태:", authorized);

  if (authorized === null) {
    return <div>관리자 인증 중...</div>;
  }

  if (!authorized) {
    console.warn("🚫 인증 실패 → 로그인 페이지로 이동");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("✅ 인증 통과 → 관리자 페이지 렌더링");
  return children;
}
