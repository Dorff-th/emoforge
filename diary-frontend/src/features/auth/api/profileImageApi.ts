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
    `/attach/profile/${memberUuid}`
  );
   const data = response.data;
  return {
    ...data,
    //publicUrl:  `${ATTACH_BASE_URL}${data.publicUrl}`,
    publicUrl:  data.publicUrl,
  };
};

export const uploadProfileImage = async (
  file: File,
  uploadType: string,
  attachmentStatus: string,
  memberUuid?: string,
  postId?: number
) => {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadType", uploadType);
  formData.append("attachmentStatus", attachmentStatus);
  if (memberUuid) formData.append("memberUuid", memberUuid);
  if (postId) formData.append("postId", postId.toString());

  const response = await axiosAttach.post<ProfileImageResponse>(
    "/attach",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const deleteProfileImage = async (attachmentId: number) => {
  await axiosAttach.delete(`/attach/profile/${attachmentId}`);
};
