// src/pages/NotFoundPage.tsx

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToastHelper } from '@/features/toast/utils/toastHelper';

const NotFoundPage = () => {

    const { showCustom } = useToastHelper()

    useEffect(() => {
        showCustom('존재하지 않는 페이지예요 🥲');
    }, [])

    
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-8">
      <div className="text-6xl mb-4">🐰 404</div>
      <p className="text-xl mb-4">앗! 길을 잃었어요... 여긴 없는 페이지예요.</p>
      <Link
        to="/"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
