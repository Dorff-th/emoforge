import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const ATTACH_BASE_URL = import.meta.env.VITE_API_ATTACH_BASE_URL;
const axiosAttach = axios.create({
  baseURL: `${ATTACH_BASE_URL}/api`,
  withCredentials: true,
});

setupInterceptors(axiosAttach);

export default axiosAttach;
