// src/pages/ProfilePage.tsx
import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosAuth from "@/api/axiosAuth";
import { addToast } from "@/store/slices/toastSlice";
import type { RootState, AppDispatch } from "@/store/store";
import NicknameModal from "@/components/profile/NicknameModal";
import EmailModal from "@/components/profile/EmailModal";
import { fetchProfileImage } from "@/api/profileImageApi";
import type { ProfileImageResponse } from "@/api/profileImageApi";
import { Settings } from "lucide-react";
import ProfileImageUploadModal from "@/components/profile/ProfileImageUploadModal";
import defaultProfileImg from "@/assets/default-profile.svg";
import { fetchProfile as fetchProfileThunk } from "@/store/slices/authSlice";

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
  const user = useSelector((state: RootState) => state.auth.user);

  const [profile, setProfile] = useState<Profile | null>(null);
  console.log(profile);
  const [openNicknameModal, setOpenNicknameModal] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<ProfileImageResponse | null>(null);

  const loadProfileImage = useCallback(async () => {
    if (!user?.uuid) {
      setProfileImage(null);
      return;
    }

    try {
      const data = await fetchProfileImage(user.uuid);
      setProfileImage(data);
    } catch {
      // Use default image when fetch fails
      setProfileImage(null);
    }
  }, [user?.uuid]);

  useEffect(() => {
    void loadProfileImage();
  }, [loadProfileImage]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axiosAuth.get("/auth/me", {});
      setProfile(res.data);
    } catch {
      dispatch(addToast({ type: "error", text: "프로필 조회 실패" }));
      window.location.href = "/login";
    }
  }, [dispatch]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleProfileImageUploaded = async () => {
    await loadProfileImage();
    await fetchProfile();
    await dispatch(fetchProfileThunk()).unwrap(); // 전역 상태 갱신
  };

  if (!user) return <p>Loading...</p>;

  const ATTACH_BASE_URL = import.meta.env.VITE_API_ATTACH_BASE_URL;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md">
        <div className="flex flex-col items-center gap-4">
          {/* Profile image */}
          <div className="relative">
            <img
              src={profileImage ? `${ATTACH_BASE_URL + profileImage.publicUrl}` : defaultProfileImg}
              alt="profile"
              className="h-24 w-24 rounded-full border"
            />
            <button
              className="absolute bottom-0 right-0 rounded-full bg-gray-700 p-1 text-white hover:bg-gray-600"
              onClick={() => setIsModalOpen(true)}
            >
              <Settings size={20} className="text-gray-200" />
            </button>
          </div>

          {/* Nickname */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{user?.nickname}</h2>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => setOpenNicknameModal(true)}
            >
              수정
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-gray-500">
            <p>{user?.email}</p>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => setOpenEmailModal(true)}
            >
              수정
            </button>
          </div>

          {/* 로그아웃 버튼은 Header로 이동 */}
          {/**
           * <Button
           *   onClick={handleLogout}
           *   className="mt-6 w-full bg-red-500 hover:bg-red-600"
           * >
           *   로그아웃
           * </Button>
           */}
        </div>
      </div>

      {openNicknameModal && (
        <NicknameModal onClose={() => setOpenNicknameModal(false)} />
      )}
      {openEmailModal && (
        <EmailModal onClose={() => setOpenEmailModal(false)} />
      )}
      <ProfileImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberUuid={user.uuid ?? ""}
        onUploaded={handleProfileImageUploaded}
      />
    </div>
  );
}
