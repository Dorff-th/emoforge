import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 px-4">
      <div className="flex flex-col items-center text-center">

        <AlertTriangle size={60} className="text-red-500 mb-4" />

        <h1 className="text-3xl font-bold mb-2">
          관리자 페이지를 찾을 수 없어요
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          요청하신 관리 페이지가 존재하지 않거나<br />
          URL이 잘못 입력된 것 같아요.
        </p>

        <Link
          to="/admin/login"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          관리자 홈으로 돌아가기
        </Link>
      </div>

      <footer className="mt-12 text-sm text-gray-400">
        Emoforge Admin Console
      </footer>
    </div>
  );
}
