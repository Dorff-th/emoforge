import React, { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getToastHelper } from "@/features/toast/utils/toastHelper";
import ThemeToggle from "@/features/ui/components/ThemeToggle";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import ProfileMenu from "@/features/user/components/ProfileMenu";
import {
  Home,
  PenLine,
  CalendarDays,
  List,
  BarChart3,
  ExternalLink,
  Search,
  Sun,
} from "lucide-react";

const Header = () => {
  const { logout, user } = useAuth();
  //const { showInfo } = useToastHelper();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const toast = getToastHelper();
  const showInfo = (message: string) => {
    toast?.showToast({ message, type: "info" });
  };

  const handleLogout = () => {
    showInfo("로그아웃 완료 👋");
    logout();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      //navigate(`/user/search-result?query=${encodeURIComponent(searchQuery)}`);
      navigate(
        `/user/search-result?query=${encodeURIComponent(
          searchQuery
        )}&page=1&size=10`
      );
    }
  };

  const menuItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
    },
    {
      path: "/user/diary-form",
      label: "Write",
      icon: PenLine,
    },
    {
      path: "/user/calendar",
      label: "Calendar",
      icon: CalendarDays,
    },
    {
      path: "/user/diary-list",
      label: "Entries",
      icon: List,
    },
    {
      path: "/user/diary-insights",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      path: SERVICE_URLS.POST,
      label: "Board",
      icon: ExternalLink,
      external: true, // ⭐ 중요
    },
  ];

  return (
    <>
      <header className="diary-header">
        <div className="diary-header__inner">
          {/* ───────────────── Top Row ───────────────── */}
          <div className="diary-header__top">
            <div className="diary-header__brand">
              <span className="text-sm font-semibold tracking-tight text-blue-600">
                EmoForge
              </span>
              <span className="brand-separator">•</span>
              <span className="brand-sub">Diary</span>
            </div>
          </div>

          {/* ───────────────── Bottom Row ───────────────── */}
          <div className="diary-header__bottom">
            {/* Left : Diary Menus */}
            <nav className="diary-header__nav">
              {menuItems
                .filter((item) => !item.external)
                .map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path} className="nav-item">
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{label}</span>
                  </Link>
                ))}
            </nav>

            {/* Center Divider */}
            <div className="diary-header__divider" />

            {/* External App : Board */}
            <div className="diary-header__external">
              {menuItems
                .filter((item) => item.external)
                .map(({ path, label, icon: Icon }) => (
                  <a
                    key={path}
                    href={path}
                    className="nav-item external"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{label}</span>
                    <ExternalLink size={14} />
                  </a>
                ))}
            </div>

            {/* Right : Utilities */}
            <div className="diary-header__utils">
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <ThemeToggle />
              </form>
            </div>
            <div className="diary-header__profile">
              <ProfileMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-blue-200 dark:border-gray-600 shadow-sm" />
    </>
  );
};

export default Header;
