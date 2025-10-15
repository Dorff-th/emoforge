package dev.emoforge.diary.service;

import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.dto.music.LangGraphRequest;
import dev.emoforge.diary.dto.music.LangGraphResponse;
import dev.emoforge.diary.dto.music.RecommendResultDTO;
import dev.emoforge.diary.global.exception.DataNotFoundException;
import dev.emoforge.diary.repository.DiaryEntryRepository;
import dev.emoforge.diary.repository.MusicRecommendHistoryRepository;
import dev.emoforge.diary.repository.MusicRecommendSongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MusicRecommendService {

    private final DiaryEntryRepository diaryEntryRepo;
    private final MusicRecommendHistoryRepository historyRepo;
    private final MusicRecommendSongRepository songRepo;
    private final LangGraphClient langGraphClient; // ✅ 새로 주입되는 클라이언트

    @Transactional
    public RecommendResultDTO recommendForDiaryEntry(Long diaryEntryId, List<String> artistPrefs, String memberUuid) {

        // 1) 입력 수집
        DiaryEntry entry = diaryEntryRepo.findById(diaryEntryId)
                .orElseThrow(() -> new DataNotFoundException("DiaryEntry not found"));

        // 2) LangGraph 호출 (B2B)
        LangGraphRequest req = LangGraphRequest.builder()
                .emotionScore(entry.getEmotion())     // int
                .feelingKo(entry.getFeelingKo())      // String
                .content(entry.getContent())          // String
                .artistPreferences(artistPrefs)       // List<String>
                .build();

        LangGraphResponse res = langGraphClient.requestMusicRecommendations(req); // 타임아웃/예외 처리 내장

        return RecommendResultDTO.from(res);

    }
}
