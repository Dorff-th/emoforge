import { useEffect, useState } from 'react';
import { fetchCategories } from '@/api/categoryApi';
import type { Category } from '@/types/Category';

interface CategorySelectProps {
  value?: number; // 선택된 카테고리 id
  onChange?: (id: number) => void;
}

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('카테고리 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">카테고리 불러오는 중...</p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">카테고리</label>
      <select
        className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
        value={value ?? ''}
        onChange={(e) => onChange?.(Number(e.target.value))}
      >
        <option value="">카테고리 선택</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
