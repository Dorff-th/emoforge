import axios from "axios";
import type { AxiosInstance } from "axios";
import { store } from "@/store/store";
import { startLoading, stopLoading } from "@/store/slices/loadingSlice";
import { addToast } from "@/store/slices/toastSlice";
import { logoutThunk } from "@/store/slices/authSlice";

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

  const API_AUTH_BASE_URL = import.meta.env.VITE_API_AUTH_BASE_URL;

  instance.interceptors.response.use(
    (response) => {
      store.dispatch(stopLoading());
      return response;
    },
    async (error) => {
      store.dispatch(stopLoading());

      const status = error?.response?.status;

      // ✅ 401 Unauthorized는 토스트 띄우지 않고 그대로 reject
      if (status === 401) {

        const originalRequest = error.config;

        // 1) refresh 요청 자체에서 401 뜨면 → 바로 로그아웃
        if (originalRequest.url.includes("/refresh")) {
          console.log("[POST-FRONTEND][REFRESH FAILURE] refresh API도 401 → 강제 로그아웃");
          store.dispatch(logoutThunk());
          return Promise.reject(error);
        }

        // 2) 이미 _retry 했으면 → 더 이상 refresh 시도 금지
        if (originalRequest._retry) {
          console.log("[POST-FRONTEND][STOP] 이미 refresh 시도한 요청 → logout 처리");
          store.dispatch(logoutThunk());
          return Promise.reject(error);
        }

        // 3) 첫 번째 401이면 → refresh 한번 시도
        originalRequest._retry = true;

        try {
          console.log("[POST-FRONTEND][TRY REFRESH] refresh_token 요청 시작.");

          await axios.post(`${API_AUTH_BASE_URL}/refresh`, null, {
            withCredentials: true,
          });

          console.log("[POST-FRONTEND][REFRESH DONE] 재요청 실행");
          return instance(originalRequest);

        } catch (refreshErr) {
          console.log("[POST-FRONTEND][REFRESH FAILED] refresh도 실패 → logout");
          store.dispatch(logoutThunk());
          return Promise.reject(refreshErr);
        }
      } // (status === 401) end

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
