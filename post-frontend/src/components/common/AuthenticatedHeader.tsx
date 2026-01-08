// src/components/common/Header.tsx
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import { logoutThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import type { AppDispatch } from "@/store/store";
import type { RootState } from "@store/store";
import { FileText, BookOpen } from "lucide-react";
import ProfileMenu from "@/components/common/ProfileMenu";

function AuthenticatedHeader() {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));

      window.location.href = `${SERVICE_URLS.POST}`; // 로그아웃 후 게시글 목록 페이지로 이동
    } catch {
      dispatch(addToast({ type: "error", text: "로그아웃 실패" }));
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex items-center justify-between py-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold tracking-tight text-blue-600"
            >
              EmoForge
            </Link>

            {/* Center: Navigation */}
            <nav className="flex items-center gap-6 text-sm text-gray-600">
              <a
                href={SERVICE_URLS.POST}
                className="group flex items-center gap-1.5
                    rounded-md border border-gray-200
                    px-3 py-1.5
                    text-sm text-gray-600
                    transition-all duration-200
                    hover:-translate-y-0.5
                  hover:border-gray-300
                  hover:bg-white
                    hover:shadow-sm"
              >
                <FileText size={16} className="text-gray-400" />
                Posts
              </a>

              <a
                href={`${SERVICE_URLS.DIARY}/user/home`}
                className="group flex items-center gap-1.5
                    rounded-md border border-gray-200
                    px-3 py-1.5
                    text-sm text-gray-600
                    transition-all duration-200
                    hover:-translate-y-0.5
                  hover:border-gray-300
                  hover:bg-white
                    hover:shadow-sm"
              >
                <BookOpen size={16} className="text-gray-400" />
                Diary
              </a>
            </nav>
          </div>

          {/* Right: Profile */}
          <ProfileMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

export default AuthenticatedHeader;
