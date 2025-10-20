import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axiosAdmin from "@/api/axiosAdmin";
export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ admin_token 쿠키 완전 삭제
    Cookies.remove("admin_token", {
      path: "/",                    // 쿠키 생성 시와 동일한 path
      domain: ".127.0.0.1.nip.io",  // 생성 시 domain과 반드시 일치해야 함
    });

    // ✅ 서버에도 로그아웃 요청 (optional)
    axiosAdmin.post("/auth/admin/logout").finally(() => {
      navigate("/admin/login");
    });
  };

  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-3">
      <h1 className="text-lg font-semibold text-gray-800">🛠 Admin Console</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
      >
        로그아웃
      </button>
    </header>
  );
}
