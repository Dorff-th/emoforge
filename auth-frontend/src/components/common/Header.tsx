// src/components/common/Header.tsx
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import { logoutThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import type { AppDispatch } from "@/store/store";

function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));
      navigate("/login");
    } catch {
      dispatch(addToast({ type: "error", text: "로그아웃 실패" }));
    }
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <a href={SERVICE_URLS.AUTH} className="text-xl font-bold text-blue-600">
          EmoForge
        </a>

        {/* Navigation */}
        <nav className="flex gap-6">
          <Link to="/profile" className="text-gray-700 hover:text-blue-600">
            프로필
          </Link>
          <a
            href={`${SERVICE_URLS.POST}/posts`}
            className="text-gray-700 hover:text-blue-600"
          >
            게시글
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="text-gray-700 hover:text-blue-600"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
