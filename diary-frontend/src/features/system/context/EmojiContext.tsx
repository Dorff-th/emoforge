import { createContext, useContext, useEffect, useState } from 'react';

const EmojiContext = createContext<any>(null);

export const EmojiProvider = ({ children }: { children: React.ReactNode }) => {
  const [emoji, setEmoji] = useState(() => localStorage.getItem('emoji') || '😎');

  useEffect(() => {
    localStorage.setItem('emoji', emoji);
  }, [emoji]);

  return (
    <EmojiContext.Provider value={{ emoji, setEmoji }}>
      {children}
    </EmojiContext.Provider>
  );
};

export const useEmoji = () => useContext(EmojiContext);
