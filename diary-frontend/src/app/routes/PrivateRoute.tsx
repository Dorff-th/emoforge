import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { SERVICE_URLS } from "@/config/constants";

interface Props {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>🔄 로그인 상태 확인 중...</div>; // 로딩 표시
  }

  if (!isAuthenticated) {
    // ✅ Auth-Service의 로그인 페이지로 전체 리디렉트
    window.location.href = `${SERVICE_URLS.AUTH}/login`; // Redirect to Auth service login page
    return null; // 렌더링 방지
  }

  return <>{children}</>;
};

export default PrivateRoute;
