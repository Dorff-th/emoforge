// src/components/profile/EmailModal.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { addToast } from "@/store/slices/toastSlice";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axiosInstance";

type Props = {
  onClose: () => void;
};

export default function EmailModal({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const isValidEmail = (value: string) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

  const handleCheck = async () => {
    if (!email.trim()) {
      dispatch(addToast({ type: "warning", text: "이메일을 입력하세요." }));
      return;
    }
    if (!isValidEmail(email)) {
      dispatch(addToast({ type: "error", text: "유효한 이메일 형식이 아닙니다." }));
      return;
    }
    try {
      setIsChecking(true);
      const res = await axiosInstance.get(`/auth/members/check-email`, {
        params: { email },
      });
      if (res.data.available) {
        setAvailable(true);
        dispatch(addToast({ type: "success", text: "사용 가능한 이메일입니다." }));
      } else {
        setAvailable(false);
        dispatch(addToast({ type: "error", text: "이미 사용 중인 이메일입니다." }));
      }
    } catch (err) {
      dispatch(addToast({ type: "error", text: "이메일 중복 확인 실패" }));
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!available) {
      dispatch(addToast({ type: "warning", text: "이메일 중복 확인이 필요합니다." }));
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.put(`/auth/members/email`, { email });
      dispatch(addToast({ type: "success", text: "이메일이 변경되었습니다." }));
      onClose();
      // TODO: 상태 갱신 로직 (authSlice.user.email 새로고침)
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          text: err.response?.data?.message || "변경 실패",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">이메일 변경</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="새 이메일 입력"
        />

        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            onClick={handleCheck}
            disabled={isChecking || !email.trim()}
          >
            {isChecking ? "확인 중..." : "중복 확인"}
          </Button>
          <Button onClick={handleSave} disabled={!available || saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
