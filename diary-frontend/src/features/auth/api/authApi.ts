import axiosInstance from "@/lib/axios/axiosInstance";

export const login = async (username: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { username, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};
