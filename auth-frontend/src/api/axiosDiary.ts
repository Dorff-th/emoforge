import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const baseUrl = import.meta.env.VITE_API_DIARY_BASE_URL; // 도메인만 들어있음

const axiosDiary = axios.create({
  baseURL: `${baseUrl}`, // ✅ 서비스 경로를 여기서 붙임
  withCredentials: import.meta.env.VITE_WITH_CREDENTIALS === "true",
});

setupInterceptors(axiosDiary);

export default axiosDiary;
