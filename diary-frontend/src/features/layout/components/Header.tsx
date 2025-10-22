import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getToastHelper } from '@/features/toast/utils/toastHelper';
import ThemeToggle from '@/features/ui/components/ThemeToggle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { SERVICE_URLS } from '@/config/constants';
import Avatar from '@/features/user/components/Avatar';

const Header = () => {
  const { logout, user } = useAuth();
  //const { showInfo } = useToastHelper();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const toast = getToastHelper();
  const showInfo = (message: string) => {
    toast?.showToast({ message, type: 'info' });
  };

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
  // 🆕 게시판 메뉴 추가
  { path: `${SERVICE_URLS.POST}/posts`, label: '🗂 게시판' },
  { path: '/user/diary-insights', label: '📊 감정 분석' },
];

return (
  <>
    <header className="bg-gradient-to-r from-sky-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 px-4 py-2 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-center flex-wrap gap-3">

        {/* 프로필 */}
        <a
          className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-300 hover:ring-2 hover:ring-pink-300 transition-all"
          href={`${SERVICE_URLS.AUTH}/profile`}
        >
          <Avatar src={user?.profileImageUrl} alt={user?.nickname} size={32} />
        </a>

        {/* ── 프로필 ↔ 메뉴 구분선 */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 opacity-60" />

        {/* 메뉴 nav */}
        <nav className="flex flex-wrap gap-2 justify-center">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              target={item.path.startsWith('http') ? '_blank' : '_self'} // 외부 링크는 새 탭
              className={clsx(
                'px-4 py-1 text-sm rounded-full transition-all duration-300 shadow-sm',
                isActive(item.path)
                  ? 'bg-blue-500 text-white font-semibold shadow-md'
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
            className="px-3 py-1 text-sm rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-2 py-1 text-sm text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all"
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
                     hover:scale-105 hover:shadow-lg transition-all"
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
