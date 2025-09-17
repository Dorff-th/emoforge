// src/api/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  //baseURL: "http://localhost:8081/api",
  baseURL: "http://auth.127.0.0.1.nip.io:8081/api",
  withCredentials: true, // ✅ 쿠키 자동 포함
});

// 응답 인터셉터 (예: 인증 실패 → 로그인 페이지 이동)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
