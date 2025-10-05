import axiosInstance from '@/lib/axios/axiosInstance';
import { SummaryData } from '@/features/summary/types/SummaryTypes';

// 오늘의 요약 데이터를 가져오는 API 였는데 오늘 입력된 회고중 가장 최근 1개만 가져오는 것으로 변경 (엔드포인트 혼동 주의)
export const fetchTodaySummary = async (): Promise<SummaryData> => {
  const res = await axiosInstance.get<SummaryData>('/diary/summary/today');
  return res.data;
};

//오늘의 감정회고 GPT 요약 조회
export const fetchTodayGptSummary = async (): Promise<{ summary: string }> => {
  const res = await axiosInstance.get('/diary/gpt/today');
  return res.data;
};




