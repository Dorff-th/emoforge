package dev.emoforge.diary.service;

import dev.emoforge.diary.domain.DiaryEntry;
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
    @Test
    @DisplayName("laggraph 추천음악 받아오기")
    void testMusicReccomend() {
        Long diaryEntryId = 21L;
        String memberUuid = "32b8b3a6-134f-48a5-a3bb-c6e33f988148";
        List<String> artistPrefs = List.of("Coldplay", "Alan Walker");

        RecommendResultDTO restDto = musicRecommendService.recommendForDiaryEntry(diaryEntryId, artistPrefs, memberUuid);

        System.out.println(restDto);
    }

}