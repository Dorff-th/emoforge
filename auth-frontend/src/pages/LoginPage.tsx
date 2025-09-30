// src/pages/LoginPage.tsx
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/toastSlice";

export default function LoginPage() {

  const dispatch = useAppDispatch();

  const handleKakaoLogin = () => {
    window.location.href = import.meta.env.VITE_KAKAO_AUTH_URL;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "unauthorized") {
      dispatch(addToast({ type: "error", text: "로그인이 필요합니다." }));
    }
  }, [dispatch])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <button
        onClick={handleKakaoLogin}
        className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-500"
      >
        카카오 로그인
      </button>
    </div>
  );
}
