import { useEffect, useState } from 'react';
import { fetchTodaySummary } from '../api/summaryApi';
import { SummaryData } from '@/features/summary/types/SummaryTypes';

export const useSummaryData = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaySummary()
      .then(data => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading };
};
