import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const AUTH_BASE_URL = import.meta.env.VITE_API_AUTH_BASE_URL;
const axiosAdmin = axios.create({
  baseURL: `${AUTH_BASE_URL}/api`,
  withCredentials: true,
});

setupInterceptors(axiosAdmin);

export default axiosAdmin;
