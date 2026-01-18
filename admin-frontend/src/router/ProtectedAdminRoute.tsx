import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/queries/useAdminAuth';
import type { JSX } from 'react';

export default function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthorized, isLoading, isError } = useAdminAuth();

  if (isLoading) {
    return <div>관리자 인증 중...</div>;
  }

  if (isError || !isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
