// src/types/Attachment.ts
export interface Attachment {
  id: number;
  fileName: string;
  originFileName: string;
  fileUrl: string; // S3나 로컬 저장소 URL
  fileSizeText: string;
  createdAt: string;
  publicUrl: string | null; // ✅ 서버 응답 기준
  fileSize: number;         // ✅ 숫자 그대로
}
