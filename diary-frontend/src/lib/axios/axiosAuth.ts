import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const axiosAuth = axios.create({
  baseURL: "http://auth.127.0.0.1.nip.io:8081/api",
  withCredentials: true,
});

setupInterceptors(axiosAuth);

export default axiosAuth;
