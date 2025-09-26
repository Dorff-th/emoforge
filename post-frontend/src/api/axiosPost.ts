import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const axiosAttach = axios.create({
  baseURL: "http://post.127.0.0.1.nip.io:8083/api",
  withCredentials: true,
});

setupInterceptors(axiosAttach);

export default axiosAttach;
