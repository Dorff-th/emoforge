import React from 'react';
import Header from '@/features/layout/components/Header';
import Calendar from '@/features/calendar/components/Calendar';

const CalendarPage = () => {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">📅 캘린더 페이지</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            감정 & 회고 입력 여부를 달력에서 한눈에 확인해보세요.
          </p>
          <Calendar />
        </div>
      </main>
    </div>
    </>
  );
};

export default CalendarPage;
