import type { AxiosInstance } from "axios";
import { SERVICE_URLS } from '@/config/constants';
import { useToastHelper } from '@/features/toast/utils/toastHelper';
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
         getLoadingControl().hideLoading();
       }
   
       const { showError } = useToastHelper();
       
       const status = error.response?.status;
       console.log(status, error.response?.data);
        if (status === 401 || status === 403) {
         // ✅ 만료된 토큰이거나 권한 오류 → 자동 로그아웃 처리
         showError('세션이 만료되어 로그아웃되었습니다.');
         window.location.href = `${SERVICE_URLS.AUTH}/login`; // Redirect to Auth service login page
       }
   
       return Promise.reject(error);
     }
   )
}