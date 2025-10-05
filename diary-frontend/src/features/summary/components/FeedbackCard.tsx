import React, { useState } from 'react';
import { useToastHelper } from '@/features/toast/utils/toastHelper';
//import { createGptFeedback } from '../api/summaryApi';


interface Props {
  feedback?: string;
  onFeedbackUpdated: (newFeedback: string) => void;
}

const FeedbackCard = ({ feedback, onFeedbackUpdated }: Props) => {
  const [loading, setLoading] = useState(false);
  const toast = useToastHelper();
  const { showSuccess, showError } = useToastHelper();

  // const handleGenerateFeedback = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await createGptFeedback();
  //     onFeedbackUpdated(res.feedback);
  //     showSuccess('GPT 피드백이 생성되었어요!');
  //   } catch (e) {
  //     showError('피드백 생성에 실패했어요 😢');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="rounded-xl bg-green-50 p-4 shadow-sm">
      <h3 className="text-md font-semibold mb-2">GPT 피드백</h3>
      {feedback ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback}</p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-2">아직 GPT 피드백이 없어요.</p>
          {/* <button
            onClick={handleGenerateFeedback}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 text-sm"
          >
            {loading ? '생성 중...' : '피드백 생성하기'}
          </button> */}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
