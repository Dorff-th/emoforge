package dev.emoforge.diary.repository;

import dev.emoforge.diary.domain.MusicRecommendHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * DiaryEntry별 추천 세션을 관리하는 Repository
 */
public interface  MusicRecommendHistoryRepository extends JpaRepository<MusicRecommendHistory, Long> {

    // ✅ 특정 DiaryEntry의 추천 내역 조회
    List<MusicRecommendHistory> findByDiaryEntryId(Long diaryEntryId);

    // ✅ 특정 사용자(memberUuid)의 모든 추천 히스토리 조회
    List<MusicRecommendHistory> findByMemberUuidOrderByCreatedAtDesc(String memberUuid);
}
