// src/components/FooterMessage.tsx

import React from 'react';
import { useEmoji } from '@/features/system/context/EmojiContext';

const messageMap: Record<string, string> = {
  '😎': '오늘도 멋지게 살아보자!',
  '😭': '울어도 괜찮아. 내일은 괜찮을 거야.',
  '😡': '화를 쏟아내고, 마음을 가다듬자.',
  '🤔': '생각이 많았던 하루였지?',
  '😴': '푹 쉬는 것도 생산성이야. Zz',
  '🤯': '오늘은 진짜 빡셌다... 수고했어!',
};

const FooterMessage = () => {
  const { emoji } = useEmoji();
  const message = messageMap[emoji] || '하루 어땠어?';

  return (
    <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
      {message}
    </div>
  );
};

export default FooterMessage;
