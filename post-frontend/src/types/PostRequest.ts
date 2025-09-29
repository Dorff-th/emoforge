import type { Tag } from './Tag';

// src/types/PostRequest.ts
export interface PostRequest {
  title: string;
  categoryId: number;
  content: string;
  tags: Tag[]; // ["spring","gpt"]
  deleteTagIds?: number[]; // 수정 모드일 때만 사용
  attachments?: File[]; // 첨부파일
}
