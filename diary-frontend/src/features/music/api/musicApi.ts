import axiosDiary from "@/lib/axios/axiosDiary";

export const getMusicRecommendations = async (diaryEntryId: string) => {
  const { data } = await axiosDiary.get(`/diary/music/${diaryEntryId}/recommendations`);
  return data;
};

export const requestMusicRecommendations = async (diaryEntryId: string, artistPreferences: string[]) => {
  const { data } = await axiosDiary.post(`/diary/music/recommend`, {
    diaryEntryId,
    artistPreferences,
  });
  return data;
};
