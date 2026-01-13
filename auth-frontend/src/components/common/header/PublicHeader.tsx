import { useState } from "react";

import { SERVICE_URLS } from "@/config/constants";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/toastSlice";
import { LogIn } from "lucide-react";
import DesktopNav from "@/components/common/header/DesktopNav";
import MobileNav from "@/components/common/header/MobileNav";

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {/* Left */}
          <div className="flex items-center gap-6">
            <a
              href={SERVICE_URLS.POST}
              className="text-sm font-semibold tracking-tight text-blue-600"
            >
              EmoForge
            </a>

            {/* PC 전용 */}
            <DesktopNav isAuthenticated={false} />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Mobile 전용 햄버거 */}
            <MobileNav.Toggle
              open={mobileOpen}
              onToggle={() => setMobileOpen((v) => !v)}
              className="flex-shrink-0"
            />

            {/* Right: Login Button */}
            <a
              href={`${SERVICE_URLS.AUTH}/login`}
              className="flex items-center gap-1.5
              text-sm font-normal
            text-blue-600
            hover:text-blue-700 truncate"
            >
              <LogIn size={16} />
              <span>Sign in</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile 메뉴 */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={false}
      />
    </header>
  );
}
