// src/api/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  //baseURL: "http://localhost:8081/api",
  baseURL: "http://auth.127.0.0.1.nip.io:8081/api",
  withCredentials: true, // ✅ 쿠키 자동 포함
});

// 캐시 방지 헤더 추가
axiosInstance.interceptors.request.use((config) => {
  config.headers["Cache-Control"] = "no-cache";
  config.headers["Pragma"] = "no-cache";
  config.headers["Expires"] = "0";
  return config;
});


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        // Refresh 요청
        await axios.post("http://auth.127.0.0.1.nip.io:8081/api/auth/refresh", {}, { withCredentials: true });

        // 원래 요청 재시도
        return axiosInstance(error.config);
      } catch (refreshError) {
        console.error("Refresh token invalid:", refreshError);
        // 로그아웃 처리
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
