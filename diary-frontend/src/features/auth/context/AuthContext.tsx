// src/features/auth/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosAuth from '@/lib/axios/axiosAuth'; // ✅ Auth-Service 전용 Axios 인스턴스
import { SERVICE_URLS } from "@/config/constants";

interface UserInfo {
  username: string;
  nickname?: string;
  role?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  /** ✅ 로그인 상태 확인 (/api/auth/me) */
  const checkAuth = async () => {
    try {
      const res = await axiosAuth.get('/auth/me', { withCredentials: true });
      setUser(res.data);
      setIsAuthenticated(true);
      console.log('✅ 로그인 상태 유지:', res.data);
    } catch (err) {
      console.warn('❌ 로그인 상태 아님 또는 세션 만료');
      setUser(null);
      setIsAuthenticated(false);
      
    }
  };

  /** ✅ 로그아웃 (쿠키 만료 처리) */
  const logout = async () => {
    try {
      await axiosAuth.post('/auth/logout', {}, { withCredentials: true });
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
    <AuthContext.Provider value={{ user, isAuthenticated, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not found!');
  return ctx;
};
