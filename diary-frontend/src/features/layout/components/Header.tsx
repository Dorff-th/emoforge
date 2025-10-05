import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToastHelper } from '@/features/toast/utils/toastHelper';
import ThemeToggle from '@/features/ui/components/ThemeToggle';
import bunnyIcon from '@/assets/characters/loading_bunny_gpt.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Header = () => {
  const { logout } = useAuth();
  const { showInfo } = useToastHelper();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    showInfo('로그아웃 완료 👋');
    logout();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      //navigate(`/user/search-result?query=${encodeURIComponent(searchQuery)}`);
      navigate(`/user/search-result?query=${encodeURIComponent(searchQuery)}&page=1&size=10`);
    }
  };

  const menuItems = [
    { path: '/', label: '🏠 홈' },
    { path: '/user/diary-form', label: '✍️ 회고 쓰기' },
    { path: '/user/calendar', label: '📆 회고 달력' },
    { path: '/user/diary-list', label: '📜 회고 목록' },
    { path: '/user/diary-insights', label: '📊 감정 분석' },
  ];

  return (
    <>
      <header className="bg-sky-100 dark:bg-gray-800 px-4 py-2">
        <div className="flex items-center justify-center flex-wrap gap-3">
          {/* 프로필 */}
          <button
            className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-pink-300 transition"
            onClick={() => console.log('MyPage 이동 예정')}
          >
            <img
              src={bunnyIcon}
              alt="프로필"
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow"
            />
          </button>

          {/* ── 프로필 ↔ 메뉴 구분선 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 opacity-60" />

          {/* 메뉴 nav */}
          <nav className="flex flex-wrap gap-2 justify-center">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'px-4 py-1 text-sm rounded-full transition-all duration-300 shadow-sm',
                  isActive(item.path)
                    ? 'bg-blue-500 text-white font-semibold'
                    : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-blue-200 hover:scale-105'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── 메뉴 ↔ 검색창 구분선 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 opacity-60" />

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex items-center gap-1">
            <input
              type="text"
              placeholder="회고 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 text-sm rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full hover:bg-blue-600"
            >
              🔍
            </button>
          </form>

          {/* ── 검색창 ↔ 로그아웃 구분선 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 opacity-60" />

          {/* 다크모드 + 로그아웃 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-1 rounded-full shadow-md text-white text-sm font-semibold
                       bg-gradient-to-r from-pink-400 to-orange-300
                       dark:from-pink-500 dark:to-orange-400
                       hover:scale-105 transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-blue-200 dark:border-gray-600 shadow-sm" />
    </>
  );
};

export default Header;
