import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { cancelWithdrawal} from "@/api/axiosWithdrawal";
import { withToast } from '@/utils/withToast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function WithdrawalPendingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [openCancelModal, setOpenCancelModal] = useState(false);

  const handleCancelConfirm = async () => {
    try {
      await withToast(
        cancelWithdrawal(),
        {
          success: "탈퇴 신청이 취소되었습니다.",
          error: "취소 중 오류가 발생했습니다.",
        }
      );

      // authSlice 상태 갱신
      await dispatch(fetchProfile()).unwrap();

      navigate("/profile");
    } catch (err) {
      console.error("탈퇴 취소 실패:", err);
    } finally {
      setOpenCancelModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">탈퇴 신청 상태입니다</h1>
      <p className="mt-2 text-gray-600">서비스 이용을 위해 탈퇴를 취소해주세요.</p>

      <button
        onClick={() => setOpenCancelModal(true)}
        className="mt-6 px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        탈퇴 신청 취소
      </button>
      {/* 🔥 확인/취소 모달 */}
      <ConfirmModal
        open={openCancelModal}
        title="탈퇴 신청 취소"
        description={`탈퇴 신청을 취소하시겠습니까?\n바로 서비스 이용이 가능합니다.`}
        onConfirm={handleCancelConfirm}
        onCancel={() => setOpenCancelModal(false)}
      />
    </div>
  );
}
