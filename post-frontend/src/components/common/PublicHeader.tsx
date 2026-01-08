import { Link } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/toastSlice";
import { LogIn, FileText } from "lucide-react";

export default function PublicHeader() {
  //다른 서비스에서 로그아웃 후 리다이렉트 되었을 때 토스트 메시지 표시
  const dispatch = useAppDispatch();
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") === "logout_success") {
    dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));
  }

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
