import type { AxiosInstance } from "axios";
import { showToast } from "@/providers/ToastProvider";

export default function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      // 401 Unauthorized는 토스트 띄우지 않고 그대로 reject
      if (status === 401) {
        return Promise.reject(error);
      }

      const message =
        error?.response?.data?.message || "요청 처리 중 오류가 발생했습니다!";

      showToast({
        type: "error",
        text: message,
      });

      return Promise.reject(error);
    }
  );
}
