// src/components/profile/NicknameModal.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { addToast } from "@/store/slices/toastSlice";
import { Button } from "@/components/ui/button";
import axiosAuth from "@/api/axiosAuth";
import { fetchProfile } from "@/store/slices/authSlice";

type Props = {
  onClose: () => void;
};

export default function NicknameModal({ onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [nickname, setNickname] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCheck = async () => {
    if (!nickname.trim()) {
      dispatch(addToast({ type: "warning", text: "닉네임을 입력하세요." }));
      return;
    }
    try {
      setIsChecking(true);
      const res = await axiosAuth.get(`/members/check-nickname`, {
        params: { nickname },
      });
      if (res.data.available) {
        setAvailable(true);
        dispatch(addToast({ type: "success", text: "사용 가능한 닉네임입니다." }));
      } else {
        setAvailable(false);
        dispatch(addToast({ type: "error", text: "이미 사용 중인 닉네임입니다." }));
      }
    } catch (err) {
      dispatch(addToast({ type: "error", text: "닉네임 중복 확인 실패" }));
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!available) {
      dispatch(addToast({ type: "warning", text: "닉네임 중복 확인이 필요합니다." }));
      return;
    }
    try {
      setSaving(true);
      await axiosAuth.put(`/members/nickname`, { nickname });
      dispatch(addToast({ type: "success", text: "닉네임이 변경되었습니다." }));
      onClose();
      dispatch(fetchProfile());
    } catch (err: any) {
      dispatch(addToast({ type: "error", text: err.response?.data?.message || "변경 실패" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">닉네임 변경</h2>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="새 닉네임 입력"
        />

        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            onClick={handleCheck}
            disabled={isChecking || !nickname.trim()}
          >
            {isChecking ? "확인 중..." : "중복 확인"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!available || saving}
          >
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
