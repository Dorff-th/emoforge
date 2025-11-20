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
import { fetchMemberPostStats, fetchMemberAttachmentStats, fetchMemberDiaryStats } from "@/api/userStatApi";

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

  
  //const [profile, setProfile] = useState<Profile | null>(null);
  const [_profile, setProfile] = useState<Profile | null>(null);
  
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
      const res = await axiosAuth.get("/me", {});
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

  //사용자 통계 불러오기
  const loadAllMemberStats = async () => {
    const [attach, posts, diary] = await Promise.all([
      fetchMemberAttachmentStats(),
      fetchMemberPostStats(),
      fetchMemberDiaryStats(),
    ]);

    return { attach, posts, diary };
  };

   // 📌 ProfilePage 최초 로드 시 통계 조회
  const [stats, setStats] = useState<{
    attach?: any;
    posts?: any;
    diary?: any;
  }>({});

  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await loadAllMemberStats();
        setStats(data);
      } catch (err: any) {
        console.error("🔴 통계 조회 실패:", err);
        setError("통계를 불러오지 못했어요 🥲");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const ATTACH_BASE_URL = import.meta.env.VITE_API_ATTACH_BASE_URL;

  return (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
      
      {/* ============================= */}
      {/* 📌 프로필 상단 영역 */}
      {/* ============================= */}
      <div className="flex flex-col items-center gap-4">

        {/* 프로필 이미지 */}
        <div className="relative">
          <img
            src={profileImage ? `${ATTACH_BASE_URL + profileImage.publicUrl}` : defaultProfileImg}
            alt="profile"
            className="h-28 w-28 rounded-full border shadow-sm object-cover"
          />
          <button
            className="absolute bottom-0 right-0 rounded-full bg-gray-700 p-1 text-white hover:bg-gray-600 shadow-md"
            onClick={() => setIsModalOpen(true)}
          >
            <Settings size={18} className="text-gray-200" />
          </button>
        </div>

        {/* 닉네임 */}
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">{user?.nickname}</h2>
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => setOpenNicknameModal(true)}
          >
            수정
          </button>
        </div>

        {/* 이메일 */}
        <div className="flex items-center gap-2 text-gray-600">
          <p>{user?.email}</p>
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => setOpenEmailModal(true)}
          >
            수정
          </button>
        </div>

        {/* 가입일 / 정보 변경일 */}
        <div className="space-y-1 text-gray-500 text-sm mt-2">
          <p>가입일: {user?.createdAt}</p>
          <p>정보 변경일: {user?.updatedAt}</p>
        </div>
      </div>

      {/* 구분선 */}
      <hr className="my-6 border-gray-200" />

      {/* ============================= */}
      {/* 📌 통계 영역 */}
      {/* ============================= */}
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-center mb-4">내 프로필 통계</h1>

        {/* 통계 박스 공용 스타일 */}
        <div className="grid gap-4">

          {/* 첨부파일 통계 */}
          <section className="rounded-lg border bg-gray-50 p-4 shadow-sm">
            <h2 className="font-semibold mb-2">📎 첨부파일 통계</h2>
            <p className="text-sm">에디터 이미지: {stats.attach?.editorImageCount}</p>
            <p className="text-sm">첨부파일: {stats.attach?.attachmentCount}</p>
          </section>

          {/* 게시글 & 댓글 통계 */}
          <section className="rounded-lg border bg-gray-50 p-4 shadow-sm">
            <h2 className="font-semibold mb-2">📝 게시글 & 댓글 통계</h2>
            <p className="text-sm">게시글 수: {stats.posts?.postCount}</p>
            <p className="text-sm">댓글 수: {stats.posts?.commentCount}</p>
          </section>

          {/* 감정 & 회고 통계 */}
          <section className="rounded-lg border bg-gray-50 p-4 shadow-sm">
            <h2 className="font-semibold mb-2">💛 감정 & 회고 통계</h2>
            <p className="text-sm">감정 & 회고 기록: {stats.diary?.diaryEntryCount}</p>
            <p className="text-sm">GPT 요약: {stats.diary?.gptSummaryCount}</p>
            <p className="text-sm">음악 추천 기록: {stats.diary?.musicRecommendHistoryCount}</p>
          </section>

        </div>
      </div>

    </div>

    {/* ============================= */}
    {/* 📌 모달 영역 */}
    {/* ============================= */}
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
