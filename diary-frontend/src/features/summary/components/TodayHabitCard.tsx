import React from 'react';

interface Props {
  habits: string[];
}

const habitEmojiMap: Record<string, string> = {
  명상: '🧘',
  운동: '🏃',
  독서: '📚',
  일찍일어나기: '⏰',
  감사일기: '🙏',
  영어공부: '🇬🇧',
  글쓰기: '✍️',
  // 새로운 습관 생기면 여기에 추가!
};

const TodayHabitCard = ({ habits }: Props) => {
  if (habits.length === 0) {
    return <div className="text-gray-400 text-sm">오늘은 기록된 습관이 없어요 😶</div>;
  }

  return (
    <div className="rounded-xl bg-blue-50 p-4 shadow-sm">
      <h3 className="text-md font-semibold mb-2">오늘 실천한 습관</h3>
      <div className="flex flex-wrap gap-2">
        {habits.map((habit, idx) => (
          <span
            key={idx}
            className="bg-white px-3 py-1 rounded-full text-sm border border-gray-300 shadow-sm"
          >
            {habitEmojiMap[habit] || '🔸'} {habit}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TodayHabitCard;
