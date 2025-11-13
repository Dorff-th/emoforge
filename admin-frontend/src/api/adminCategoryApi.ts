import axiosPostsAdmin from '@/api/axiosPostsAdmin';
import type { Category } from '@/types/Category';

export async function fetchCategories(): Promise<Category[]> {
  const res = await axiosPostsAdmin.get('/admin/categories');
  return res.data;
}

export async function createCategory(name: string): Promise<void> {
  await axiosPostsAdmin.post('/admin/categories', { name });
}

export async function updateCategory(id: number, name: string): Promise<void> {
  await axiosPostsAdmin.put(`/admin/categories/${id}`, { name });
}

export async function deleteCategory(id: number): Promise<void> {
  // ⚠️ 백엔드에서 자동으로 Post는 기본 카테고리로 이동 처리
  await axiosPostsAdmin.delete(`admin/categories/${id}`);
}
