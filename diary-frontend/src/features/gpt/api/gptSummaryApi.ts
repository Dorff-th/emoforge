import axiosDiary from "@/lib/axios/axiosDiary";

export const generateGptSummary = async (date: string): Promise<string> => {
  const response = await axiosDiary.post('/diary/gpt-summary', {
    date
  });
  return response.data.summary;
};
