import { useState } from "react";
import axiosAuthAdmin from "@/api/axiosAuthAdmin";
import ReCAPTCHA from "react-google-recaptcha";
import { addToast } from '@store/slices/toastSlice';
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      addToast({ text: 'reCAPTCHA 인증이 필요합니다.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosAuthAdmin.post("/admin/login", {
        username,
        password,
        captchaToken, // ✅ reCAPTCHA 토큰 전달
      });

      if (res.status === 200) {
        addToast({ text: '로그인에 성공했습니다.', type: 'success' });
        //window.location.href = "/admin/dashboard";
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* ✅ reCAPTCHA 체크박스 */}
        <div className="flex justify-center mb-4">
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
