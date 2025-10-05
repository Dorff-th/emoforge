import axios from "axios";
import setupInterceptors from "./setupInterceptors";

const axiosDiary = axios.create({
  baseURL: "http://diary.127.0.0.1.nip.io:8084/api",
  withCredentials: true,
});

setupInterceptors(axiosDiary);

export default axiosDiary;
