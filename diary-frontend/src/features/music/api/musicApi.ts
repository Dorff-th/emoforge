import axiosDiary from "@/lib/axios/axiosDiary";

export const getMusicRecommendations = async (diaryEntryId: number) => {
  const { data } = await axiosDiary.get(`/music/${diaryEntryId}/recommendations`);
  return data;
};

export const requestMusicRecommendations = async (diaryEntryId: number, artistPreferences: string[]) => {
  const { data } = await axiosDiary.post(`/music/recommend`, {
    diaryEntryId,
    artistPreferences,
  });
  return data;
};
