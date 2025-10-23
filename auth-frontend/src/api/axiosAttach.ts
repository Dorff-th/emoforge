import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const backendApiAttchUrl = import.meta.env.VITE_API_ATTACH_BASE_URL;
const axiosAttach = axios.create({
  //baseURL: "http://attach.127.0.0.1.nip.io:8082/api",
  baseURL: backendApiAttchUrl + "/api",
  withCredentials: true,
});

setupInterceptors(axiosAttach);

export default axiosAttach;
