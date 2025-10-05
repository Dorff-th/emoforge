import { DiaryEntry } from '@/features/diary/api/diaryApi'; // ✅ 수정됨
import { emotionEmojiMap, emotionLabelMap, EmotionLevel } from '@/features/diary/types/emotionMap';

export default function DiaryDetail({ diary }: { diary: DiaryEntry }) {
  const emotionValue = Number(diary.emotion);
  const emotionEmoji = emotionEmojiMap[emotionValue as EmotionLevel] ?? '😶';
  const emotionLabel = emotionLabelMap[emotionValue as EmotionLevel] ?? '';

  const parsedHabits = (() => {
    try {
      return JSON.parse(diary.habitTags);
    } catch (e) {
      return [];
    }
  })();

  return (
    <div className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 space-y-4">
      <div className="text-xl">
        {emotionEmoji}
        <span className="text-gray-700 dark:text-gray-300">
          오늘의 감정: <strong>{emotionLabel}</strong>
        </span>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        ✅ 완료한 습관?:{' '}
        <span className="font-medium text-black dark:text-white">
          {parsedHabits.join(', ') || '없음'}
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        🇰🇷 기분(KO): <span className="text-black dark:text-white">{diary.feelingKo}</span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        🇺🇸 기분(EN): <span className="text-black dark:text-white">{diary.feelingEn}</span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        📝 회고: <span className="text-black dark:text-white">{diary.content}</span>
      </div>

      <div>
        <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
          💬 GPT 피드백
        </div>
        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-lg px-4 py-3 text-sm italic shadow-inner relative">
          {diary.feedback ?? '아직 GPT 피드백이 없습니다.'}
          <div className="absolute left-2 -bottom-2 w-3 h-3 bg-blue-100 dark:bg-blue-900 transform rotate-45 shadow-inner"></div>
        </div>
      </div>
    </div>
  );
}
