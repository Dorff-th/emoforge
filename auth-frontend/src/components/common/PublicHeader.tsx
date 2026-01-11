import { useState } from "react";
import { Link } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/toastSlice";
import { LogIn, FileText, Layers, Info, ChevronDown } from "lucide-react";

export default function PublicHeader() {
  //다른 서비스에서 로그아웃 후 리다이렉트 되었을 때 토스트 메시지 표시
  const dispatch = useAppDispatch();
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") === "logout_success") {
    dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));
  }

  const [aboutOpen, setAboutOpen] = useState(false);

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
              <Link
                to="/about/emoforge"
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-100"
              >
                <Layers size={16} />
                <span>About</span>
                <ChevronDown size={14} className="mt-[1px]" />
              </Link>

              {aboutOpen && (
                <div className="absolute left-0 top-full pt-2 mt-0 w-48 rounded-md border bg-white shadow-lg z-20">
                  <Link
                    to="/about/emoforge"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Layers size={14} />
                    Emoforge
                  </Link>

                  <Link
                    to="/about/intro"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <Info size={14} />
                    Intro
                  </Link>
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
            </nav>
          </div>

          {/* Right: Login Button */}
          <a
            href={`${SERVICE_URLS.AUTH}/login`}
            className="flex items-center gap-1.5
              text-sm font-normal
            text-blue-600
            hover:text-blue-700"
          >
            <LogIn size={16} />
            <span>Sign in</span>
          </a>
        </div>
      </div>
    </header>
  );
}
