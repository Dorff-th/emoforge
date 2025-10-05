// src/components/diary/DiaryListForDateModal.tsx
import { useState } from 'react';
import { emotionEmojiMap, EmotionLevel } from '@/features/diary/types/emotionMap';
import { X } from 'lucide-react';
import { DiaryEntry} from '@/features/calendar/api/calendarApi';
import { generateGptSummary } from '@/features/gpt/api/gptSummaryApi'; // ✅ 추가
import { useToastHelper } from '@/features/toast/utils/toastHelper';


interface DiaryListForDateModalProps {
  date: string; // 'YYYY-MM-DD'
  onClose: () => void;
  diaryEntries?: DiaryEntry[]; // 선택된 날짜의 회고 목록
  summary : string
  onSummaryGenerated?: (newSummary: string) => void; // ✅ 추가
}

const DiaryListForDateModal = ({ date, onClose, diaryEntries, summary, onSummaryGenerated }: DiaryListForDateModalProps) => {
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [gptSummary, setGptSummary] = useState<string | null>(summary || null);
  const [loading, setLoading] = useState(false);

  const dayData = diaryEntries;
  const diaryList = dayData ?? [];

  // 최신순 정렬
  const sortedList = [...diaryList].sort((a, b) => Number(b.id) - Number(a.id));

  const { showError, showSuccess } = useToastHelper();

  const handleGptSummaryClick = async() => {
    try {
      setLoading(true);
      const result = await generateGptSummary(date);
      setGptSummary(result);
      onSummaryGenerated?.(result);
      showSuccess('GPT 요약 생성 완료!');
    } catch (error) {
      showError('GPT 요약 생성 중 오류 발생!');
    } finally {
      setLoading(false);
    }
  };

  const parsedHabits = ((habitTags:string) => {
    try {
      return JSON.parse(habitTags);
    } catch (e) {
      return [];
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">📅 {date}</h2>

        {/* ✅ GPT 요약 또는 버튼 */}
        {gptSummary ? (
          <div className="mb-4 p-3 bg-yellow-100 text-sm rounded leading-relaxed text-yellow-800">
            <strong>GPT 요약:</strong> {gptSummary}
          </div>
        ) : (
          <button
            onClick={handleGptSummaryClick}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            {loading ? 'GPT 요약 생성 중...' : '🧠 GPT 요약 생성'}
          </button>
        )}

        {/* 회고 리스트는 그대로 유지 */}
        {sortedList.map((entry, idx) => (
          <div key={entry.id} className="mb-4 border rounded-md p-3">
            <button
              className="w-full text-left font-semibold text-blue-900 hover:underline"
              onClick={() => setOpenEntryId(openEntryId === entry.id ? null : entry.id)}
            >
              Diary Entry {sortedList.length - idx}
            </button>

            {openEntryId === entry.id && (
              <div className="mt-3 space-y-2 text-sm text-gray-800">
                <div>
                  😊 감정 상태:{' '}
                  <span className="text-xl">
                    {emotionEmojiMap[entry.emotion as EmotionLevel]}
                  </span>
                </div>
                <div>✅ 오늘의 습관: {parsedHabits(entry.habitTags).join(', ') || '없음'}</div>
                <div>
                  💬 오늘의 기분 한마디: {entry.feelingKo} / <i>{entry.feelingEn}</i>
                </div>
                <div>📝 회고: {entry.content}</div>
                <div>🤖 GPT 피드백: {entry.feedback}</div>
              </div>
            )}
          </div>
        ))}

        {sortedList.length === 0 && (
          <p className="text-center text-gray-500">해당 날짜에 작성된 회고가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DiaryListForDateModal;
