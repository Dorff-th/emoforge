package dev.emoforge.diary.service;

import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.dto.music.MusicRecommendHistoryDTO;
import dev.emoforge.diary.dto.music.RecommendResultDTO;
import dev.emoforge.diary.global.exception.DataNotFoundException;
import dev.emoforge.diary.repository.DiaryEntryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MusicRecommendServiceTest {

    @Autowired
    private MusicRecommendService musicRecommendService;
    //@Test
    @DisplayName("LangGraph-Service를 호출해 DiaryEntry의 감정 데이터를 기반으로 음악 추천을 생성·저장한다")
    void testMusicRecommend() {
        Long diaryEntryId = 21L;
        String memberUuid = "32b8b3a6-134f-48a5-a3bb-c6e33f988148";
        List<String> artistPrefs = List.of("Coldplay", "Alan Walker");

        RecommendResultDTO restDto = musicRecommendService.recommendForDiaryEntry(diaryEntryId, artistPrefs, memberUuid);

        System.out.println(restDto);
    }

    @Test
    @DisplayName("추천된 음악 목록 조회에 성공한다.")
    void testGetMusicRecommend() {
        Long diaryEntryId = 21L;

        MusicRecommendHistoryDTO historyDTO = musicRecommendService.getRecommendationsForDiary(diaryEntryId);

        System.out.println(historyDTO.getHistoryId());
        System.out.println(historyDTO.getKeywordSummary());
        historyDTO.getSongs().forEach(song->{System.out.println(song);});
    }

}
