import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeToast } from "@/store/slices/toastSlice";
import { useEffect } from "react";

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.toast.messages);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(messages[0].id));
      }, 3000); // 3초 후 자동 제거
      return () => clearTimeout(timer);
    }
  }, [messages, dispatch]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded px-4 py-2 shadow-md text-white transition-all ${
            msg.type === "success"
              ? "bg-green-600"
              : msg.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
