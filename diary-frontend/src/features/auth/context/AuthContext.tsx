// src/features/auth/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosAuth from '@/lib/axios/axiosAuth'; // ✅ Auth-Service 전용 Axios 인스턴스
import { SERVICE_URLS } from "@/config/constants";
import { fetchProfileImage } from '@/features/auth/api/profileImageApi';

interface UserInfo {
  username: string;
  nickname?: string;
  role?: string;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  /** ✅ 로그인 상태 확인 (/api/auth/me) */
  const [isLoading, setIsLoading] = useState(true);
  const checkAuth = async () => {
    try {
      const res = await axiosAuth.get('/me', { withCredentials: true });
      const profile = res.data;

      let profileImageUrl: string | null = profile.profileImageUrl ?? null;
      // 프로필 이미지가 없으면 별도 API 호출로 가져오기
      if (!profileImageUrl && profile.uuid) {
        try {
          const profileImage = await fetchProfileImage(profile.uuid);
          profileImageUrl = profileImage.publicUrl;
          profile.profileImageUrl = profileImageUrl;
        } catch {
          profileImageUrl = null; // fallback when profile image fetch fails
        }
      }

      setUser(profile);
      setIsAuthenticated(true);
      //console.log('✅ 로그인 상태 유지:', res.data);
    } catch (err) {
      console.warn('❌ 로그인 상태 아님 또는 세션 만료');
      setUser(null);
      setIsAuthenticated(false);
    }   finally {
      setIsLoading(false);
    }
  };

  /** ✅ 로그아웃 (쿠키 만료 처리) */
  const logout = async () => {
    try {
      await axiosAuth.post('/logout', {}, { withCredentials: true });
    } catch (e) {
      console.warn('Logout request failed (이미 만료되었을 수 있음)');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = `${SERVICE_URLS.AUTH}/login`; // Redirect to Auth service login page
      //return null; // 렌더링 방지
    }
  };

  /** ✅ 앱 로드 시 인증 상태 자동 확인 */
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, checkAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not found!');
  return ctx;
};
