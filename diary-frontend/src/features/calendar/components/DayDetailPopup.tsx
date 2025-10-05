import React from 'react';

interface DayDetailPopupProps {
  date: string;
  onClose: () => void;
}

const DayDetailPopup = ({ date, onClose }: DayDetailPopupProps) => {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 p-4 shadow-lg rounded z-50">
      <h3 className="text-lg font-semibold">📖 {date} 상세 보기</h3>
      {/* TODO: 감정, 회고 내용, GPT 요약 등 */}
      <button onClick={onClose} className="mt-4 text-blue-500">닫기</button>
    </div>
  );
};

export default DayDetailPopup;
