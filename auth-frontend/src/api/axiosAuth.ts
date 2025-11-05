import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const baseUrl = import.meta.env.VITE_API_AUTH_BASE_URL; // 도메인만 들어있음

const axiosAuth = axios.create({
  baseURL: `${baseUrl}`, 
  withCredentials: import.meta.env.VITE_WITH_CREDENTIALS === "true",
});

setupInterceptors(axiosAuth);

export default axiosAuth;
