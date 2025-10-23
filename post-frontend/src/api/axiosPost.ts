import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const POST_BASE_URL = import.meta.env.VITE_API_POST_BASE_URL;
const axiosPost = axios.create({
  baseURL: `${POST_BASE_URL}/api`,
  withCredentials: true,
});

setupInterceptors(axiosPost);

export default axiosPost;
