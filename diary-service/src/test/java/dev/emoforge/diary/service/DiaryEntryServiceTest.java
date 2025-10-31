package dev.emoforge.diary.service;

import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.domain.MusicRecommendHistory;
import dev.emoforge.diary.domain.MusicRecommendSong;
import dev.emoforge.diary.repository.DiaryEntryRepository;
import dev.emoforge.diary.repository.MusicRecommendHistoryRepository;
import dev.emoforge.diary.repository.MusicRecommendSongRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
@SpringBootTest
@Transactional // 테스트 후 rollback 수행(db에서 데이터 안지워짐)
class DiaryEntryServiceTest {

    @Autowired
    private DiaryEntryService diaryEntryService;

    @Autowired
    private DiaryEntryRepository diaryEntryRepository;

    @Autowired
    private MusicRecommendHistoryRepository historyRepository;

    @Autowired
    private MusicRecommendSongRepository songRepository;

    /**
     * ✅ 회고 삭제 시 연관 데이터(MusicRecommendHistory, MusicRecommendSong)
     *    가 Cascade 로 함께 삭제되는지 확인
     */
    @Test
    void deleteDiaryEntry_cascadeDeleteTest() {
        // 1️⃣ 테스트 대상 DiaryEntry ID (실제 존재하는 ID로 변경 필요)
        Long testDiaryEntryId = 38L; // 💡 실제 DB에 존재하는 ID 입력

        log.info("🧭 삭제 전 상태 확인");

        DiaryEntry entry = diaryEntryRepository.findById(testDiaryEntryId)
                .orElseThrow(() -> new IllegalArgumentException("회고를 찾을 수 없습니다. ID=" + testDiaryEntryId));

        MusicRecommendHistory history = entry.getMusicRecommendHistory();
        List<MusicRecommendSong> songs = history.getSongs();

        log.info(" - DiaryEntry ID: {}", entry.getId());
        log.info(" - MusicRecommendHistory ID: {}", history.getId());
        log.info(" - MusicRecommendSong IDs: {}", songs.stream().map(MusicRecommendSong::getId).toList());

        // 2️⃣ 삭제 수행
        diaryEntryService.deleteDiaryEntry(testDiaryEntryId, false);

        log.info("🧭 삭제 후 상태 확인");

        boolean entryExists = diaryEntryRepository.findById(testDiaryEntryId).isPresent();
        boolean historyExists = historyRepository.findById(history.getId()).isPresent();
        boolean anySongExists = songs.stream()
                .anyMatch(song -> songRepository.findById(song.getId()).isPresent());

        log.info(" - DiaryEntry 존재 여부: {}", entryExists);
        log.info(" - MusicRecommendHistory 존재 여부: {}", historyExists);
        log.info(" - MusicRecommendSong 존재 여부: {}", anySongExists);

        // 3️⃣ 검증
        assertThat(entryExists).isFalse();
        assertThat(historyExists).isFalse();
        assertThat(anySongExists).isFalse();

        log.info("✅ Cascade 삭제 테스트 통과!");
    }

}