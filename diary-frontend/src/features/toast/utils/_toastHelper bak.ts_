// src/components/EmotionToast/toastHelper.ts
import { useEmotionToast } from '@/features/toast/hooks/useEmotionToast';


export const useToastHelper = () => {
  const { showToast } = useEmotionToast()

  return {
    showSuccess: (msg: string) =>
      showToast({ type: 'success', message: msg }),

    showError: (msg: string) =>
      showToast({ type: 'error', message: msg }),

    showWarning: (msg: string) =>
      showToast({ type: 'warn', message: msg }),

    showInfo: (msg: string) =>
      showToast({ type: 'info', message: msg }),

    showGPT: (msg: string) =>
      showToast({ type: 'gpt', message: msg }),

    // 필요 시 사용자 정의
    showCustom: (msg: string) =>
      showToast({ type: 'custom', message: msg }),
  }
}
