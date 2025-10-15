package dev.emoforge.diary.repository;

import dev.emoforge.diary.domain.MusicRecommendSong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 개별 추천 곡을 관리하는 Repository
 */
public interface MusicRecommendSongRepository extends JpaRepository<MusicRecommendSong, Long> {

    // ✅ 특정 추천 세션(historyId)에 포함된 모든 곡 조회
    List<MusicRecommendSong> findByHistoryId(Long historyId);

    // ✅ 좋아요 누른 곡들만 조회
    List<MusicRecommendSong> findByLikedTrue();

    // ✅ 특정 아티스트의 곡 추천 이력 조회
    List<MusicRecommendSong> findByArtistName(String artistName);
}
