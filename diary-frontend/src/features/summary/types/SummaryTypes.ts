export interface SummaryData {
  diaryDate: string; // YYYY-MM-DD
  emotion: number; // 1~5
  feelingKo: string;
  feelingEn: string;
  habitTags: string;
  content: string;
  summary?: string;
  feedback?: string;
}
