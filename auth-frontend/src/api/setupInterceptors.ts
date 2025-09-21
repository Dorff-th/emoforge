import type { AxiosInstance } from "axios";
import { store } from "@/store/store";
import { startLoading, stopLoading } from "@/store/slices/loadingSlice";
import { addToast } from "@/store/slices/toastSlice";

export default function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config) => {
      store.dispatch(startLoading());
      return config;
    },
    (error) => {
      store.dispatch(stopLoading());
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      store.dispatch(stopLoading());
      return response;
    },
    (error) => {
      store.dispatch(stopLoading());

      const message =
        error?.response?.data?.message || "요청 처리 중 오류가 발생했습니다!";

      store.dispatch(
        addToast({
          type: "error",
          text: message,
        })
      );

      return Promise.reject(error);
    }
  );
}
