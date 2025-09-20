// src/api/axiosInstance.ts
import axios from "axios";
import { store } from "@/store/store";
import { startLoading, stopLoading } from "@/store/slices/loadingSlice";
import { addToast } from "@/store/slices/toastSlice";

const axiosInstance = axios.create({
  //baseURL: "http://localhost:8081/api",
  baseURL: "http://auth.127.0.0.1.nip.io:8081/api",
  withCredentials: true, // ✅ 쿠키 자동 포함
});

// 요청 시작 → 로딩 시작
axiosInstance.interceptors.request.use((config) => {
  store.dispatch(startLoading());
  return config;
});

// 응답 종료 → 로딩 종료
// 응답 처리
axiosInstance.interceptors.response.use(
  async (response) => {
    store.dispatch(stopLoading());
    return response;
  },
  async (error) => {
    store.dispatch(stopLoading());

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          store.dispatch(
            addToast({ type: "error", text: "잘못된 요청입니다 (400)" })
          );
          break;
        case 401:
          store.dispatch(
            addToast({ type: "error", text: "로그인이 필요합니다 (401)" })
          );
          break;
        case 403:
          store.dispatch(
            addToast({ type: "error", text: "접근 권한이 없습니다 (403)" })
          );
          break;
        case 404:
          store.dispatch(
            addToast({ type: "error", text: "요청한 리소스를 찾을 수 없습니다 (404)" })
          );
          break;
        case 500:
          store.dispatch(
            addToast({ type: "error", text: "서버 오류가 발생했습니다 (500)" })
          );
          break;
        default:
          store.dispatch(
            addToast({
              type: "error",
              text: `알 수 없는 오류가 발생했습니다 (${status})`,
            })
          );
      }
    } else {
      store.dispatch(
        addToast({
          type: "error",
          text: "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.",
        })
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
