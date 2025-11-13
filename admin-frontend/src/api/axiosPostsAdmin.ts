import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const POST_BASE_URL = import.meta.env.VITE_API_POST_BASE_URL;
const axiosPostsAdmin = axios.create({   // 기존 axiosAdmin -> axiosAuthAdmin 으로 이름 변경
  baseURL: `${POST_BASE_URL}`,
  withCredentials: true,
});

setupInterceptors(axiosPostsAdmin);

export default axiosPostsAdmin;
