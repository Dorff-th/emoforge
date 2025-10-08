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

 instance.interceptors.response.use(
  (response) => {
    const skipGlobalLoading = (response.config as any).meta?.skipGlobalLoading;
    if (!skipGlobalLoading) {
      getLoadingControl().hideLoading();
    }
    return response;
  },
  (error) => {
    const skipGlobalLoading = (error.config as any)?.meta?.skipGlobalLoading;
    if (!skipGlobalLoading) {
      getLoadingControl().hideLoading(); // ✅ 에러 시에도 로딩 끄기
    }

    const toast = getToastHelper();
    const status = error.response?.status;
    const message = error.response?.data?.message || "요청 처리 중 오류 발생";

    if (status === 404) {
      //toast?.showToast?.({ message: "데이터를 찾을 수 없습니다.", type: "warn" }); // 데이터가 없는 경우는 무시
    } else if (status === 401 || status === 403) {
      toast?.showToast?.({ message: "세션이 만료되어 로그아웃되었습니다.", type: "error" });
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