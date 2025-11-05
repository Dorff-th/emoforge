// src/api/axiosLang.ts (Python FastAPI backend)
import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const LANGGRAPH_BASE_URL = import.meta.env.VITE_API_LANGGRAPH_BASE_URL;
const axiosLang = axios.create({
  baseURL: `${LANGGRAPH_BASE_URL}/api/langgraph`,
  withCredentials: true,
});

setupInterceptors(axiosLang);

export default axiosLang;
