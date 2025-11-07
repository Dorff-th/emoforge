// src/api/profileImageApi.ts
import axiosAttach from "@/lib/axios/axiosAttach";

export interface ProfileImageResponse {
  id: number;
  fileName: string;
  originFileName: string;
  fileType: string;
  fileUrl: string;   // 내부 저장 경로나 원본
  publicUrl: string; // 실제 <img src> 에 쓸 URL
  createdAt: string;
}

//const ATTACH_BASE_URL = import.meta.env.VITE_ATTACH_BASE_URL;

export const fetchProfileImage = async (memberUuid: string) => {
  const response = await axiosAttach.get<ProfileImageResponse>(
    `/profile/${memberUuid}`
  );
   const data = response.data;
  return {
    ...data,
    //publicUrl:  `${ATTACH_BASE_URL}${data.publicUrl}`,
    publicUrl:  data.publicUrl,
  };
};
