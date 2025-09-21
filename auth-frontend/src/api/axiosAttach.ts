import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const axiosAttach = axios.create({
  baseURL: "http://attach.127.0.0.1.nip.io:8082/api",
  withCredentials: true,
});

setupInterceptors(axiosAttach);

export default axiosAttach;
