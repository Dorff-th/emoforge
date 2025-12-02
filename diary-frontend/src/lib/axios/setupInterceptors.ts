import axios from "axios";
import type { AxiosInstance } from "axios";
import { SERVICE_URLS } from '@/config/constants';
import { getToastHelper  } from '@/features/toast/utils/toastHelper';
import { getLoadingControl } from '@/features/system/context/LoadingControl';


export default function setupInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(
      (config) => {
    
        // ✅ 👇 전역 로딩 제외 조건 추가
        const skipGlobalLoading = (config as any).meta?.skipGlobalLoading;
        if (!skipGlobalLoading) {
          getLoadingControl().showLoading();
        }
    
        return config;
      },
      (error) => {
        getLoadingControl().hideLoading();
        return Promise.reject(error);
      }
    );

 const API_AUTH_BASE_URL = import.meta.env.VITE_API_AUTH_BASE_URL;
    
 instance.interceptors.response.use(
  (response) => {
    const skipGlobalLoading = (response.config as any).meta?.skipGlobalLoading;
    if (!skipGlobalLoading) {
      getLoadingControl().hideLoading();
    }
    return response;
  },
  async (error) => {
    const skipGlobalLoading = (error.config as any)?.meta?.skipGlobalLoading;
    if (!skipGlobalLoading) {
      getLoadingControl().hideLoading(); // ✅ 에러 시에도 로딩 끄기
    }

    const toast = getToastHelper();
    const status = error.response?.status;
    const message = error.response?.data?.message || "요청 처리 중 오류 발생";

    console.log("[DIARY-FRONTEND][RESPONSE ERROR]", { status, message });

    if (status === 404) {

    } else if (status === 401) { 
      const originalRequest = error.config;
       // refresh 자체 실패 → 무한 루프 방지
      if (originalRequest.url.includes("/api/auth/refresh")) {
        window.location.href = `${SERVICE_URLS.AUTH}/login`;
        return Promise.reject(error);
      }

      // 재시도 방지
      if (originalRequest._retry) {
        window.location.href = `${SERVICE_URLS.AUTH}/login`;
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // refresh 요청은 Auth-Service로만!
        console.log("[DIARY-FRONTEND][TRY REFRESH] refresh_token 요청 시작.");
        await axios.post(
          `${API_AUTH_BASE_URL}/refresh`,
          null,
          { withCredentials: true }
        );

        // 재요청
        console.log("[DIARY-FRONTEND][REFRESH DONE] 재요청 실행");
        return instance(originalRequest);

      } catch (refreshErr) {
        console.log("[DIARY-FRONTEND][REFRESH FAILED] refresh_token 요청 실패.");
        toast?.showToast?.({
          message: "세션이 만료되어 로그아웃되었습니다.",
          type: "error",
        });
        window.location.href = `${SERVICE_URLS.AUTH}/login`;
        return Promise.reject(refreshErr);
      }

    } else if (status === 403) {
      toast?.showToast?.({ message: "접근 권한이 없습니다.", type: "error" });
      window.location.href = `${SERVICE_URLS.AUTH}/login`;
    } else if (status === 500) {
      toast?.showToast?.({ message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", type: "error" });
    } else {
      toast?.showToast?.({ message, type: "error" });
    }

    return Promise.reject(error);
  }
);



}