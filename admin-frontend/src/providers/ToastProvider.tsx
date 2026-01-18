import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// React 외부에서 토스트를 호출하기 위한 핸들러 (Axios 인터셉터 등)
let externalToastHandler: ((toast: Omit<Toast, "id">) => void) | null = null;

export function setToastHandler(handler: typeof externalToastHandler) {
  externalToastHandler = handler;
}

export function showToast(toast: Omit<Toast, "id">) {
  if (externalToastHandler) {
    externalToastHandler(toast);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 외부 핸들러 등록
  useEffect(() => {
    setToastHandler(addToast);
    return () => setToastHandler(null);
  }, [addToast]);

  // 자동 제거 (3초 후)
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

// 내장 ToastContainer 컴포넌트
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded px-4 py-2 shadow-md text-white transition-all ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : toast.type === "warning"
              ? "bg-yellow-600"
              : "bg-blue-600"
          }`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
