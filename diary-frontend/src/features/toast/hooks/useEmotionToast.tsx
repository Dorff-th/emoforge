// src/components/EmotionToast/useEmotionToast.ts
import { createContext, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warn' | 'gpt' | 'custom';

export interface EmotionToast {
  id: string;
  message: string;
  type: ToastType;
}

interface EmotionToastInput {
  message: string;
  type?: ToastType;
}

interface EmotionToastState {
  toasts: EmotionToast[];
  showToast: (toast: EmotionToastInput) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<EmotionToastState | null>(null);

export const useEmotionToastState = (): EmotionToastState => {
  const [toasts, setToasts] = useState<EmotionToast[]>([]);

  const showToast = ({ message, type = 'info' }: EmotionToastInput) => {
    const id = Date.now().toString();
    const newToast: EmotionToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export const useEmotionToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('EmotionToastProvider로 감싸야 합니다.');
  return context;
};
