// src/components/common/Header.tsx
import { useDispatch, useSelector } from "react-redux";
import { SERVICE_URLS } from "@/config/constants";
import { logoutThunk } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import type { AppDispatch } from "@/store/store";
import type { RootState } from '@store/store';
import Avatar from '@/components/common/Avatar';

function AuthenticatedHeader() {
  const dispatch = useDispatch<AppDispatch>();
  //const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));
      //navigate("/login");
      window.location.href = `${SERVICE_URLS.AUTH}/login`; // Redirect to Auth service login page
    } catch {
      dispatch(addToast({ type: "error", text: "로그아웃 실패" }));
    }
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <a href={SERVICE_URLS.AUTH} className="text-xl font-bold text-blue-600">
          EmoForge
        </a>

        {/* Navigation */}
        <nav className="flex gap-6">
          <a href={`${SERVICE_URLS.AUTH}/profile`} className="text-gray-700 hover:text-blue-600">
            <Avatar src={user?.profileImageUrl} alt={user?.nickname} size={32} />
          </a>
          <a
            href={`${SERVICE_URLS.POST}/posts`}
            className="text-gray-700 hover:text-blue-600"
          >
            게시글
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="text-gray-700 hover:text-blue-600"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  );
}

export default AuthenticatedHeader;
