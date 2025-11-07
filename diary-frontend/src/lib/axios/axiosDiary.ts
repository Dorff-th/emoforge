import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const DIARY_API_URL = import.meta.env.VITE_API_DIARY_BASE_URL;
const axiosDiary = axios.create({
  baseURL: `${DIARY_API_URL}`,
  withCredentials: true,
});

setupInterceptors(axiosDiary);

export default axiosDiary;
