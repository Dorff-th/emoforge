// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from '@/features/layout/pages/NotFoundPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import UserHomePage from '@/features/user/pages/UserHomePage';
import PrivateRoute from './PrivateRoute';
import DiaryInputPage from '@/features/diary/pages/DiaryInputPage';
import CalendarPage from '@/features/calendar/pages/CalendarPage';
import DiaryListPage from '@/features/diary/pages/DiaryListPage';
import DiaryInsightsPage from '@/features/statistics/pages/EmotionStatsPage';
import SearchResultPage from '@/features/search/pages/SearchResultPage';  

const AppRouter = () => (

    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* 루트에 접근했을 때 토큰 여부에 따라 분기 */}
      <Route
        path="/"
        element={
          <PrivateRoute>
             <Navigate to="/user/home" replace />
          </PrivateRoute>
        }
      />
      <Route path="/user/home" element={<PrivateRoute><UserHomePage /></PrivateRoute>} /> {/* 추가 */}
      <Route path="/user/diary-form" element={<PrivateRoute><DiaryInputPage /></PrivateRoute>} /> {/* 추가 */}

      { /* 캘린더 페이지 */}
      <Route path="/user/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />

      { /* 다이어리 목록 페이지 */}
      <Route path="/user/diary-list" element={<PrivateRoute><DiaryListPage /></PrivateRoute>} />

      { /* 감정 통계 페이지 */}
      <Route path="/user/diary-insights" element={<PrivateRoute><DiaryInsightsPage /></PrivateRoute>} />

      {/* 검색 결과 페이지  */}
      {/* <Route path="/user/search-result" element={<SearchResultPage />} />  */}
      <Route path="/user/search-result" element={<PrivateRoute><SearchResultPage /></PrivateRoute>} />

      {/* 404 page*/}
       <Route path="*" element={<NotFoundPage />} />
       
    </Routes>

);

export default AppRouter;

