package dev.emoforge.diary.controller;

import dev.emoforge.diary.dto.music.MusicRecommendHistoryDTO;
import dev.emoforge.diary.dto.music.RecommendResultDTO;
import dev.emoforge.diary.service.MusicRecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diary/music")
@RequiredArgsConstructor
public class MusicRecommendController {

    private final MusicRecommendService musicRecommendService;

    /**
     * 추천된 음악 목록 조회
     */
    @GetMapping("/{diaryEntryId}/recommendations")
    public ResponseEntity<MusicRecommendHistoryDTO> getRecommendations(@PathVariable Long diaryEntryId) {
        MusicRecommendHistoryDTO dto = musicRecommendService.getRecommendationsForDiary(diaryEntryId);
        return ResponseEntity.ok(dto);
    }

    /**
     * 사용자의 DiaryEntry 감정 데이터를 기반으로 LangGraph-Service에서 음악 추천을 수행한다.
     */
    @PostMapping("/recommend")
    public ResponseEntity<RecommendResultDTO> recommendMusic(
            @RequestParam("diaryEntryId") Long diaryEntryId,
            @RequestBody(required = false) List<String> artistPrefs,
            Authentication authentication
    ) {
        String memberUuid = authentication.getPrincipal().toString();
        RecommendResultDTO result = musicRecommendService.recommendForDiaryEntry(diaryEntryId, artistPrefs, memberUuid);
        return ResponseEntity.ok(result);
    }
}
