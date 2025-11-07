import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const AUTH_API_URL = import.meta.env.VITE_API_AUTH_BASE_URL;
const axiosAuth = axios.create({
  baseURL: `${AUTH_API_URL}`,
  withCredentials: true,
});

setupInterceptors(axiosAuth);

export default axiosAuth;
