// src/pages/LoginPage.tsx
import { Button } from "@/components/ui/button";
import kakaoIcon from "@/assets/kakao-icon.svg";

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = "http://auth.127.0.0.1.nip.io:8081/oauth2/authorization/kakao";
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* 서비스 타이틀 */}
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Auth Service
        </h1>

        {/* 카카오 로그인 버튼 */}
        <Button
          onClick={handleKakaoLogin}
          className="w-full bg-[#FEE500] text-black hover:bg-[#e6d600]"
          size="lg"
        >
          <img 
            src={kakaoIcon} 
            alt="카카오" 
            className="mr-2 h-5 w-5"
          />
          카카오로 로그인
        </Button>
      </div>
    </div>
  );
}
