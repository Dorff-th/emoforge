// src/pages/ProfilePage.tsx
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { logoutThunk } from "@/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      navigate("/login");
    } catch {
      // toast 등 실패 UI 처리
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md">
        <div className="flex flex-col items-center gap-4">
          <img
            src={user?.profileUrl ?? "/default_profile.png"}
            alt="profile"
            className="h-24 w-24 rounded-full border"
          />
          <h2 className="text-xl font-semibold">{user?.nickname}</h2>
          <p className="text-gray-500">{user?.email}</p>

          <Button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-500 hover:bg-red-600"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
