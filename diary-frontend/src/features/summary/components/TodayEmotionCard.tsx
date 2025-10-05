import React from 'react';
import { EmotionLevel, emotionEmojiMap } from '@/features/diary/types/emotionMap';

interface Props {
  emotion: EmotionLevel;
  feelingKo: string;
  feelingEn: string;
}

const TodayEmotionCard = ({ emotion, feelingKo, feelingEn }: Props) => {
  return (
    <div className="rounded-xl bg-yellow-100 p-4 shadow-sm">
      <div className="text-4xl text-center">{emotionEmojiMap[emotion]}</div>
      <div className="text-center mt-2 text-lg font-semibold">{feelingKo}</div>
      <div className="text-center text-sm text-gray-500">"{feelingEn}"</div>
    </div>
  );
};

export default TodayEmotionCard;
