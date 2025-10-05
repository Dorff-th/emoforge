import { useEffect, useState } from 'react';
import { fetchDiaryList, DiaryGroup, DiaryEntry } from '@/features/diary/api/diaryApi';
import DiaryItem from '@/features/diary/components/DiaryItem';
import Pagination from '@/features/diary/components/Pagination';
import Header from '@/features/layout/components/Header';

export default function DiaryListPage() {
  const [page, setPage] = useState(1);
  const [diaryGroups, setDiaryGroups] = useState<DiaryGroup[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchDiaryList(page); // data: DiaryGroup[]

      setDiaryGroups(data.content); 
      
      setTotalPages(data.totalPages); 
    };
    load();
  }, [page]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-4">📋 나의 회고 목록</h2>

          {diaryGroups.map((group) => (
            <div key={group.date} className="mb-8">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                {group.date}
              </h3>
              {group.summary && (
                <div className="text-sm text-gray-500 italic mb-2">
                  GPT 요약: {group.summary}
                </div>
              )}

              <div className="space-y-4">
                {group.entries.map((diary: DiaryEntry) => (
                  <DiaryItem
                    key={diary.id}
                    diary={diary}
                    isOpen={openId === diary.id}
                    onToggle={() =>
                      setOpenId(openId === diary.id ? null : diary.id)
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </>
  );
}
