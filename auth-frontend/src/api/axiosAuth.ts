import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const backendApiAuthUrl = import.meta.env.VITE_API_AUTH_BASE_URL;
const axiosAuth = axios.create({
  //baseURL: "http://auth.127.0.0.1.nip.io:8081/api",
  baseURL: backendApiAuthUrl + "/api",
  withCredentials: true,
});

setupInterceptors(axiosAuth);

export default axiosAuth;
