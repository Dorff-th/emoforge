import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { openTermsModal } from "@/store/slices/termsSlice";
import axiosAuth from "@/api/axiosAuth";
import { fetchProfile } from "@/store/slices/authSlice";
import { addToast } from "@/store/slices/toastSlice";
import KakaoLoading from "@/components/common/KakaoLoading";

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      dispatch(
        addToast({
          type: "error",
          text: "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
        })
      );
      navigate("/login");
      return;
    }

    // 🚀 async IIFE 방식으로 비동기 처리
    (async () => {
      try {
        // 1) 인가코드 → 백엔드 전달
        const res = await axiosAuth.post(`/kakao`, { code });
        const data = res.data;

        // 2) 신규 회원 → 약관 동의 필요
        if (data.status === "NEED_AGREEMENT") {
          dispatch(
            openTermsModal({
              kakaoId: data.kakaoId, // 신규가입 판단용 키
              nickname: data.nickname, // 기본 닉네임
            })
          );
          dispatch(
            addToast({
              type: "info",
              text: "약관에 동의해야 가입을 완료할 수 있습니다.",
            })
          );
          navigate("/auth/terms");
          return;
        }

        // 3) 기존 회원 → 로그인 성공
        if (data.status === "LOGIN_OK") {
          // JWT는 이미 쿠키에 저장되어 있음
          await dispatch(fetchProfile());
          navigate("/profile");
          return;
        }

        // 4) 예외 처리
        dispatch(
          addToast({
            type: "error",
            text: "카카오 로그인 처리 중 알 수 없는 응답입니다.",
          })
        );
        navigate("/login");
      } catch (err) {
        console.error("카카오 로그인 오류:", err);
        dispatch(
          addToast({
            type: "error",
            text: "카카오 로그인 처리 중 오류가 발생했습니다.",
          })
        );
        navigate("/login");
      }
    })(); // ← 즉시 실행 async 함수 끝
  }, [dispatch, navigate]);

  return <KakaoLoading />;
}
