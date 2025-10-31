import axiosDiary from "@/lib/axios/axiosDiary";

export const getMusicRecommendations = async (diaryEntryId: number) => {
  const { data } = await axiosDiary.get(`/diary/music/${diaryEntryId}/recommendations`);
  return data;
};

export const requestMusicRecommendations = async (diaryEntryId: number, artistPreferences: string[]) => {
  const { data } = await axiosDiary.post(`/diary/music/recommend`, {
    diaryEntryId,
    artistPreferences,
  });
  return data;
};
