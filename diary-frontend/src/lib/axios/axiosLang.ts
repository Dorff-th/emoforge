// src/api/axiosLang.ts (Python FastAPI backend)
import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const axiosLang = axios.create({
  baseURL: "http://lang.127.0.0.1.nip.io:8000/api",
  withCredentials: true,
});

setupInterceptors(axiosLang);

export default axiosLang;
