import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const AUTH_BASE_URL = import.meta.env.VITE_API_AUTH_BASE_URL;
const axiosAuthAdmin = axios.create({   // 기존 axiosAdmin -> axiosAuthAdmin 으로 이름 변경
  baseURL: `${AUTH_BASE_URL}`,
  withCredentials: true,
});

setupInterceptors(axiosAuthAdmin);

export default axiosAuthAdmin;
