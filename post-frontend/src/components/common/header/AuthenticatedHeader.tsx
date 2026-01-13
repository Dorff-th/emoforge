// src/components/common/Header.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SERVICE_URLS } from "@/config/constants";
import { logoutThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import type { AppDispatch, RootState } from "@/store/store";
import ProfileMenu from "@/components/common/ProfileMenu";
import DesktopNav from "@/components/common/header/DesktopNav";
import MobileNav from "@/components/common/header/MobileNav";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = !!user;

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
          {/* Left */}
          <div className="flex items-center gap-6">
            <a
              href={SERVICE_URLS.POST}
              className="text-sm font-semibold tracking-tight text-blue-600"
            >
              EmoForge
            </a>

            {/* PC 전용 */}
            <DesktopNav isAuthenticated={isAuthenticated} />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Mobile 전용 햄버거 */}
            <MobileNav.Toggle
              open={mobileOpen}
              onToggle={() => setMobileOpen((v) => !v)}
            />

            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Mobile 메뉴 */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
};

export default Header;
