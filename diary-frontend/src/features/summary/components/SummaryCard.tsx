import React, { useState, useEffect } from 'react';
import { useToastHelper } from '@/features/toast/utils/toastHelper'; // 너의 토스트 헬퍼 기준
import { fetchTodayGptSummary } from '../api/summaryApi';

interface Props {
  summary?: string;
  onSummaryUpdated: (newSummary: string) => void;
}

const SummaryCard = ({ summary, onSummaryUpdated }: Props) => {

const { showSuccess, showError } = useToastHelper();

  const [loading, setLoading] = useState(false);
  const toast = useToastHelper();

  const [gptSummary, setGptSummary] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayGptSummary()
      .then(data => setGptSummary(data.summary))
      .finally(() => setLoading(false));
  }, []);

  

  return (
    <div className="rounded-xl bg-purple-50 p-4 shadow-sm">
      <h3 className="text-md font-semibold mb-2">GPT 요약</h3>
      {gptSummary ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{gptSummary}</p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-2">아직 요약이 없어요!</p>
          {/* <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-1 rounded-md hover:bg-purple-600 text-sm"
          >
            {loading ? '요약 중...' : '요약 생성하기'}
          </button> */}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
