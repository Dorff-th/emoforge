// src/components/common/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '@/features/system/context/ThemeContext';

const ThemeToggle = () => {
  
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="flex items-center">
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
