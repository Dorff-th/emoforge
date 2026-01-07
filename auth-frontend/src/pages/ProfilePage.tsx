// src/pages/ProfilePage.tsx
import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import {
  fetchMemberPostStats,
  fetchMemberAttachmentStats,
  fetchMemberDiaryStats,
} from "@/api/userStatApi";
import { requestWithdrawal } from "@/api/axiosWithdrawal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { withToast } from "@/utils/withToast";
import { logoutThunk } from "@/store/slices/authSlice";
import {
  Image,
  Paperclip,
  FileText,
  MessageCircle,
  BookOpen,
  Sparkles,
  Music,
  BarChart3,
  Trash2,
  Pencil,
  Mail,
  UserPlus,
  Edit3,
} from "lucide-react";

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
  const [profileImage, setProfileImage] = useState<ProfileImageResponse | null>(
    null
  );

  const navigate = useNavigate();

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

  const [withdrawalTarget, setWithdrawalTarget] = useState<any | null>(null);

  // 회원탈퇴 여부 묻는 모달에서 "확인" 눌렀을 때
  const handleWithdrawalConfirm = async () => {
    if (!withdrawalTarget) return;

    try {
      await withToast(requestWithdrawal(), {
        success:
          "탈퇴 신청이 완료되었습니다.\n다시 로그인하려면 탈퇴 취소가 필요합니다.",
        error: "탈퇴 신청 중 오류가 발생했습니다.",
      });
      // 정상 요청 후 자동 로그아웃
      await dispatch(logoutThunk()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("탈퇴 요청 실패:", err);
      // withToast가 이미 에러 토스트 처리해 줌
    } finally {
      // 모달 닫기
      setWithdrawalTarget(null);
    }
  };

  const handleCancelWithdrawal = () => {
    setWithdrawalTarget(null);
  };

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
              src={
                profileImage
                  ? `${ATTACH_BASE_URL + profileImage.publicUrl}`
                  : defaultProfileImg
              }
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
              <Pencil size={16} />
            </button>
          </div>

          {/* 이메일 */}
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={16} className="text-gray-600" />
            <span className="leading-none">{user?.email}</span>

            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => setOpenEmailModal(true)}
            >
              <Pencil size={16} />
            </button>
          </div>

          {/* 가입일 / 정보 변경일 */}
          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <UserPlus size={14} className="text-gray-400" />
              <span>Joined on</span>
              <span className="ml-auto text-gray-400">{user?.createdAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <Edit3 size={14} className="text-gray-400" />
              <span>Last updated</span>
              <span className="ml-auto text-gray-400">{user?.updatedAt}</span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <hr className="my-6 border-gray-200" />

        {/* ============================= */}
        {/* 📌 통계 영역 */}
        {/* ============================= */}
        <div className="space-y-2">
          <h3 className="mb-3 flex items-center justify-center gap- text-sm font-semibold text-gray-700">
            <BarChart3 size={16} className="text-gray-500" />
            <span>Profile Statistics</span>
          </h3>
          {/* 통계 박스 공용 스타일 */}
          <div className="grid gap-4">
            {/* ───────── 프로필 통계 ───────── */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <StatCard
                icon={<Image />}
                label="Images"
                value={stats.attach?.editorImageCount}
                title="Images uploaded through the editor"
              />
              <StatCard
                icon={<Paperclip />}
                label="Files"
                value={stats.attach?.attachmentCount}
                title="Total files attached to your posts"
              />
              <StatCard
                icon={<FileText />}
                label="Posts"
                value={stats.posts?.postCount}
                title="Posts you have created"
              />
              <StatCard
                icon={<MessageCircle />}
                label="Comments"
                value={stats.posts?.commentCount}
                title="Comments you have written"
              />
            </div>

            <div className="my-2 border-t border-gray-200/60" />

            <div className="mt-1 grid grid-cols-2 gap-2">
              <StatCard
                size="sm"
                icon={<BookOpen />}
                label="Records"
                value={stats.diary?.diaryEntryCount}
                title="Your emotion and reflection records"
              />
              <StatCard
                size="sm"
                icon={<Sparkles />}
                label="GPT Summary"
                value={stats.diary?.gptSummaryCount}
                title="AI-generated summaries of your records"
              />
              <StatCard
                size="sm"
                icon={<Music />}
                label="Music Recs"
                value={stats.diary?.musicRecommendHistoryCount}
                title="Music recommendations based on your emotions"
              />
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* 📌 회원탈퇴 버튼 영역 */}
        {/* ============================= */}
        <div className="mt-6 text-center">
          <button
            className="
              inline-flex items-center gap-2
              text-xs text-red-500
            hover:text-red-600 hover:underline"
            onClick={() => setWithdrawalTarget(true)}
          >
            <Trash2 size={14} />
            Delete Account
          </button>
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
      {/* 🔥 회원탈퇴 버튼 클릭시 나오는 모달*/}
      <ConfirmModal
        open={!!withdrawalTarget}
        title="회원탈퇴 확인"
        description={
          withdrawalTarget
            ? `정말 회원 탈퇴를 진행하시겠습니까?\n탈퇴 신청 후 10일 뒤 모든 데이터가 삭제됩니다.`
            : ""
        }
        onConfirm={handleWithdrawalConfirm}
        onCancel={handleCancelWithdrawal}
      />
    </div>
  );
}

/* ───────── 통계 카드 ───────── */
type StatCardSize = "md" | "sm";
function StatCard({
  size = "md",
  icon,
  label,
  value,
  title,
}: {
  size?: StatCardSize;
  icon: React.ReactNode;
  label: string;
  value: number;
  title?: string;
}) {
  const isSmall = size === "sm";

  return (
    <div
      title={title}
      className={`
        flex flex-col items-center
        rounded-xl bg-gray-50 border border-gray-200
        transition
        hover:bg-gray-100
        ${isSmall ? "p-3" : "p-4"}
      `}
    >
      <div className={isSmall ? "text-gray-500" : "text-gray-600"}>{icon}</div>

      <div
        className={`
          mt-2 font-semibold
          ${isSmall ? "text-lg" : "text-xl"}
        `}
      >
        {value}
      </div>

      <div
        className={`
          text-gray-500
          ${isSmall ? "text-xs" : "text-sm"}
        `}
      >
        {label}
      </div>
    </div>
  );
}
