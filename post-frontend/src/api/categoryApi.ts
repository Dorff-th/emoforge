//카테고리 목록 조회
import axiosPost from '@/api/axiosPost';
import type { Category } from '@/types/Category';

export async function fetchCategories(): Promise<Category[]> {
  const res = await axiosPost.get('/categories');
  return res.data;
}
