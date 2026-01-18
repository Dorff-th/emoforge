import { useQuery } from '@tanstack/react-query';
import axiosAuthAdmin from '@/api/axiosAuthAdmin';

export interface AdminInfo {
  username: string;
  role: string;
  message: string;
}

export const adminAuthKeys = {
  me: ['admin', 'me'] as const,
};

async function fetchAdminMe(): Promise<AdminInfo> {
  const res = await axiosAuthAdmin.get('/admin/me');
  return res.data;
}

export function useAdminMe() {
  return useQuery({
    queryKey: adminAuthKeys.me,
    queryFn: fetchAdminMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useAdminAuth() {
  const query = useAdminMe();

  const isAuthorized = query.isSuccess && query.data?.role === 'ROLE_ADMIN';
  const isLoading = query.isLoading;
  const isError = query.isError;

  return {
    isAuthorized,
    isLoading,
    isError,
    adminInfo: query.data,
  };
}
