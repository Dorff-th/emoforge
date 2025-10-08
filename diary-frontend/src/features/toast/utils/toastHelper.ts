// src/components/EmotionToast/toastHelper.ts
import { useEmotionToast } from '@/features/toast/hooks/useEmotionToast';


let toastGlobal: ReturnType<typeof useEmotionToast> | null = null;

export const useToastHelper = () => {
  const toast = useEmotionToast();
  toastGlobal = toast; // ✅ 전역에 저장
  return toast;
};

export const getToastHelper = () => toastGlobal;
