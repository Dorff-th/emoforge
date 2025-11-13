import { useEffect, useState } from "react";
import axiosAuthAdmin from "@/api/axiosAuthAdmin";

interface AdminInfo {
  username: string;
  role: string;
  message: string;
}

export default function AdminDashboardPage() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await axiosAuthAdmin.get("/admin/me", {});
        setAdminInfo(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "인증 실패");
      }
    };

    fetchAdminInfo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-[480px] text-center">
        <h1 className="text-2xl font-bold mb-4">관리자 대시보드</h1>

        {adminInfo ? (
          <>
            <p className="text-gray-700 mb-2">
              <b>관리자 계정:</b> {adminInfo.username}
            </p>
            <p className="text-gray-700 mb-4">
              <b>권한:</b> {adminInfo.role}
            </p>
            <p className="text-green-600 font-semibold">{adminInfo.message}</p>
          </>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-400">관리자 정보를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}
