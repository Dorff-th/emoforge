// src/components/LoadingOverlay.tsx
import React from 'react';
import { useLoading } from '@/features/system/context/LoadingContext';
import loadingBunny from '@/assets/characters/loading_bunny_gpt.png'; // ← 새 이미지 경로

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <img
          src={loadingBunny}
          alt="GPT 토끼 로딩 중"
          className="w-[170px] h-[256px] animate-bounce"
        />
        <div className="mt-4 text-gray-700 dark:text-white text-base font-semibold animate-pulse">
          GPT 토끼가 준비 중이에요...
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
