// src/components/common/Header.tsx
import { useDispatch, useSelector } from "react-redux";
//import { useNavigate } from "react-router-dom";
import { SERVICE_URLS } from "@/config/constants";
import { logoutThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import type { AppDispatch, RootState } from "@/store/store";
import Avatar from '@/components/common/Avatar';

function Header() {
  const dispatch = useDispatch<AppDispatch>();
  //const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      //dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));
      //navigate("/login"); //외부 서비스인 PostService로 이동
      window.location.href = `${SERVICE_URLS.POST}/posts?state=logout_success`; 
    } catch {
      dispatch(addToast({ type: "error", text: "로그아웃 실패" }));
    }
  };

  return (
  <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
    <div className="max-w-6xl mx-auto flex justify-between items-center py-3 px-5">
      {/* Logo */}
      <a
        href={SERVICE_URLS.AUTH}
        className="text-2xl font-extrabold text-blue-600 tracking-tight hover:text-blue-700 transition-all duration-300 hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]"
      >
        EmoForge
      </a>

      {/* Navigation */}
      <nav className="flex items-center gap-6 text-[15px] font-medium text-gray-700">
        {/* Avatar */}
        <a
          href={`${SERVICE_URLS.AUTH}/profile`}
          className="relative group"
          title={user?.nickname}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm group-hover:border-blue-400 transition-all duration-300">
            <Avatar src={user?.profileImageUrl} alt={user?.nickname} size={36} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
        </a>

        {/* Menu Links */}
        <a
          href={`${SERVICE_URLS.POST}/posts`}
          className="flex items-center gap-1 hover:text-blue-600 hover:scale-[1.05] transition-all"
        >
          📚 게시글
        </a>

        <a
          href={`${SERVICE_URLS.DIARY}/user/home`}
          className="flex items-center gap-1 hover:text-blue-600 hover:scale-[1.05] transition-all"
        >
          😊 감정 일기
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-700 hover:text-red-500 hover:scale-[1.05] transition-all"
        >
          🚪 로그아웃
        </button>
      </nav>
    </div>
  </header>
);
}

export default Header;
