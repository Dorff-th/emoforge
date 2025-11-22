import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { closeTermsModal } from "@/store/slices/termsSlice";
import { fetchProfile } from "@/store/slices/authSlice";
import axiosAuth from "@/api/axiosAuth";
import { addToast } from "@/store/slices/toastSlice";
import { useLocation } from "react-router-dom";

export default function TermsAgreementPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { kakaoId, nickname } = useAppSelector((state) => state.terms);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [expandTerms, setExpandTerms] = useState(true);
  const [expandPrivacy, setExpandPrivacy] = useState(true);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const previewMode = new URLSearchParams(location.search).get("preview") === "true";

  // 🔥 "최초 진입" 시에만 kakaoId 체크하도록 변경
  useEffect(() => {
    if (!previewMode && !kakaoId) {
      dispatch(addToast({ type: "error", text: "잘못된 접근입니다. 다시 로그인해주세요." }));
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← 🔥 빈 배열로 최초 1회만 실행

  const allAgreed = agreeTerms && agreePrivacy;

  const handleAgree = async () => {
    if (!allAgreed) return;
    setLoading(true);

    try {
      const res = await axiosAuth.post(
        `${import.meta.env.VITE_API_AUTH_BASE_URL}/kakao/signup`,
        { kakaoId, nickname }
      );

      console.log("Signup response:", res.data);

      await dispatch(fetchProfile());
      // 약관 모달 상태 초기화
      dispatch(closeTermsModal());
      // 🔥 가입 성공 → 바로 profile 이동
      navigate("/profile");

    } catch (err) {
      console.error(err);
      dispatch(addToast({ type: "error", text: "회원가입 중 문제가 발생했습니다." }));
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const [serviceTerms, setServiceTerms] = useState("");
  const [privacyTerms, setPrivacyTerms] = useState("");

  useEffect(() => {
    fetch(new URL("@/assets/terms/service_terms.txt", import.meta.url))
      .then(res => res.text())
      .then(setServiceTerms);

    fetch(new URL("@/assets/terms/privacy_policy.txt", import.meta.url))
      .then(res => res.text())
      .then(setPrivacyTerms);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8">

        {/* 페이지 헤더 */}
        <h1 className="text-2xl font-bold mb-2 text-center">약관 동의</h1>
        <p className="text-center text-gray-600 mb-6">
          {nickname ? `${nickname}님, 환영합니다! 😊` : "환영합니다!"}
        </p>

        {/* 약관 항목 1 */}
        <div className="mb-6 border rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandTerms(!expandTerms)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold">[필수] 서비스 이용약관</span>
            <span>{expandTerms ? "▲" : "▼"}</span>
          </button>

          {expandTerms && (
            <div className="p-4 h-48 overflow-y-scroll text-sm leading-relaxed bg-white whitespace-pre-wrap border rounded-xl">
              {serviceTerms}
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 border-t flex items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span className="text-sm">해당 약관에 동의합니다.</span>
          </div>
        </div>

        {/* 약관 항목 2 */}
        <div className="mb-6 border rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandPrivacy(!expandPrivacy)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
          >
            <span className="font-semibold">[필수] 개인정보 처리방침</span>
            <span>{expandPrivacy ? "▲" : "▼"}</span>
          </button>

          {expandPrivacy && (
            <div className="p-4 h-48 overflow-y-scroll text-sm leading-relaxed bg-white whitespace-pre-wrap border rounded-xl">
              {privacyTerms}
            </div>
          )}

          <div className="px-4 py-3 bg-gray-50 border-t flex items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
            />
            <span className="text-sm">해당 내용에 동의합니다.</span>
          </div>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleAgree}
          disabled={!allAgreed || loading}
          className={`
            w-full py-3 text-lg rounded-xl transition 
            ${allAgreed && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          {loading ? "가입 처리중..." : "동의하고 계속하기"}
        </button>
      </div>
    </div>
  );
}
