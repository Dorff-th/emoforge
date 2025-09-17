// src/pages/LoginPage.tsx
export default function LoginPage() {
  const handleKakaoLogin = () => {
    //window.location.href = "http://auth.127.0.0.1.nip.io:8081/oauth2/authorization/kakao";
    window.location.href = import.meta.env.VITE_KAKAO_AUTH_URL;
  };

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
