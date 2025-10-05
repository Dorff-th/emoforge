// src/components/EmojiDisplay.tsx

import React from 'react';
import { useEmoji } from '@/features/system/context/EmojiContext';

const emojiList = ['😎', '😭', '😡', '🤔', '😴', '🤯'];

const EmojiDisplay = () => {
  const { emoji, setEmoji } = useEmoji();

  return (
    <div className="text-center mb-6">
      {/* 선택된 이모지 */}
      <div className="text-6xl relative -top-1 mb-4">{emoji}</div>

      {/* 이모지 선택 버튼들 */}
      <div className="flex gap-2 justify-center flex-wrap">
        {emojiList.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`text-2xl transition-transform transform hover:scale-125
              ${e === emoji
                ? 'opacity-100 scale-125'
                : 'opacity-50 hover:opacity-80'}
              dark:text-white`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiDisplay;
