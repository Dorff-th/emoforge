// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { addToast } from "@/store/slices/toastSlice";
import type { RootState, AppDispatch } from "@/store/store";
import { logoutThunk } from "@/store/slices/authSlice";

import NicknameModal from "@/components/profile/NicknameModal";
import EmailModal from "@/components/profile/EmailModal";

interface Profile {
  uuid: string;
  username: string;
  nickname: string;
  role: string;
  status: string;
  profielUrl: string | null;
}

export default function ProfilePage() {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [openNicknameModal, setOpenNicknameModal] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);

  useEffect(() => {
    axiosInstance.get("/auth/me",{})
      .then((res) => {
        return setProfile(res.data)})
      .catch(() => {
        dispatch(addToast({ type: "error", text: "프로필 조회 실패" }));
        window.location.href = "/login";
      }); 
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      dispatch(addToast({ type: "info", text: "로그아웃 되었습니다." }));
      navigate("/login");
    } catch {
      dispatch(addToast({ type: "error", text: "로그아웃 실패" }));
    }
  };

  if (!user) return <p>Loading...</p>;

   return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md">
        <div className="flex flex-col items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="relative">
            <img
              src={user?.profileUrl ?? "/default_profile.png"}
              alt="profile"
              className="h-24 w-24 rounded-full border"
            />
            <button
              className="absolute bottom-0 right-0 rounded-full bg-gray-700 p-1 text-white hover:bg-gray-600"
              onClick={() => setOpenImageModal(true)}
            >
              ✏️
            </button>
          </div>

          {/* 닉네임 */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{user?.nickname}</h2>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => setOpenNicknameModal(true)}
            >
              수정
            </button>
          </div>

          {/* 이메일 */}
          <div className="flex items-center gap-2 text-gray-500">
            <p>{user?.email}</p>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => setOpenEmailModal(true)}
            >
              수정
            </button>
          </div>

          {/* 로그아웃 버튼 */}
          <Button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-500 hover:bg-red-600"
          >
            로그아웃
          </Button>
        </div>
      </div>

      {/* 모달들 */}
      {openNicknameModal && (
        <NicknameModal onClose={() => setOpenNicknameModal(false)} />
      )}
      {openEmailModal && (
        <EmailModal onClose={() => setOpenEmailModal(false)} />
      )}
      {/* {openImageModal && (
        <ProfileImageModal onClose={() => setOpenImageModal(false)} />
      )} */}
    </div>
  );

}
