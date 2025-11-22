import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { startLoading, stopLoading } from "@/store/slices/loadingSlice";

export default function UiTestPage() {

  console.log("🔥 UiTest page loaded", status);

  const dispatch = useDispatch();
  const confirm = useConfirmDialog();

  const handleToast = () => {
    dispatch(addToast({ type: "success", text: "토스트 메시지 테스트!" }));
  };

  const handleLoading = async () => {
    dispatch(startLoading());
    await new Promise((resolve) => setTimeout(resolve, 1500));
    dispatch(stopLoading());
  };

  const handleConfirm = async () => {
    const ok = await confirm({
      title: "삭제 확인",
      description: "정말 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
    });
    if (ok) {
      dispatch(addToast({ type: "info", text: "삭제되었습니다." }));
    } else {
      dispatch(addToast({ type: "warning", text: "취소되었습니다." }));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">UI Test Page</h1>
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleToast}>
        토스트 테스트
      </button>
      <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleLoading}>
        로딩 테스트
      </button>
      <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleConfirm}>
        Confirm 테스트
      </button>
    </div>
  );
}
