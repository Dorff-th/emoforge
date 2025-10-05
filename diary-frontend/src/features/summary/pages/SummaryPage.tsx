import React, { useEffect, useState } from 'react';
import { useSummaryData } from '../hooks/useSummaryData';
import { EmotionLevel } from '@/features/diary/types/emotionMap';
import TodayEmotionCard from '../components/TodayEmotionCard';
import TodayHabitCard from '../components/TodayHabitCard';
import SummaryCard from '../components/SummaryCard';
import FeedbackCard from '../components/FeedbackCard';
import TodayDiaryCard from '../components/TodayDiaryCard';

const SummaryPage = () => {
  const { summary, loading } = useSummaryData();

  const [gptSummary, setGptSummary] = useState('');
  const [gptFeedback, setGptFeedback] = useState('');

  // ✅ summary 값이 로드되면 내부 상태 초기화
  useEffect(() => {
    if (summary) {
      setGptSummary(summary.summary ?? '');
      setGptFeedback(summary.feedback ?? '');
    }
  }, [summary]);

  if (loading) return <div className="text-center">불러오는 중...</div>;
  if (!summary) return <div className="text-center">오늘 회고가 없습니다.!</div>;

  const parsedHabits = (() => {
    try {
      return JSON.parse(summary.habitTags);
    } catch (e) {
      return [];
    }
  })();

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">오늘의 감정 요약 !</h2>
      <TodayEmotionCard
        emotion={summary.emotion as EmotionLevel}
        feelingKo={summary.feelingKo}
        feelingEn={summary.feelingEn}
      />
      <TodayHabitCard habits={parsedHabits} />
      <TodayDiaryCard content={summary.content} />
      <FeedbackCard
        feedback={gptFeedback}
        onFeedbackUpdated={(newFeedback) => setGptFeedback(newFeedback)}
      />
      <SummaryCard
        summary={gptSummary}
        onSummaryUpdated={(newSummary) => setGptSummary(newSummary)}
      />
    </div>
  );
};

export default SummaryPage;
