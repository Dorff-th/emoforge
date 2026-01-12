// src/components/common/Header.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import { logoutThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import type { AppDispatch } from "@/store/store";
import type { RootState } from "@store/store";
import { FileText, BookOpen, Layers, Info, ChevronDown } from "lucide-react";
import ProfileMenu from "@/components/common/ProfileMenu";

function AuthenticatedHeader() {
  const [aboutOpen, setAboutOpen] = useState(false);

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
            <nav
              className="relative flex items-center gap-6 text-sm text-gray-600 "
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <a
                href={`${SERVICE_URLS.AUTH}/about/emoforge`}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-100"
              >
                <Layers size={16} />
                <span>About</span>
                <ChevronDown size={14} className="mt-[1px]" />
              </a>

              {aboutOpen && (
                <div className="absolute left-0 top-full pt-2 mt-0 w-48 rounded-md border bg-white shadow-lg z-20">
                  <a
                    href={`${SERVICE_URLS.AUTH}/about/emoforge`}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Layers size={14} />
                    Emoforge
                  </a>

                  <a
                    href={`${SERVICE_URLS.AUTH}/about/intro`}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Info size={14} />
                    Intro
                  </a>
                </div>
              )}
            </nav>

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
