package dev.emoforge.diary.dto.music;

import dev.emoforge.diary.domain.MusicRecommendHistory;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MusicRecommendHistoryDTO {
    private Long historyId;
    private String keywordSummary;
    private List<MusicRecommendSongDTO> songs;

    public static MusicRecommendHistoryDTO fromEntity(MusicRecommendHistory history) {
        return MusicRecommendHistoryDTO.builder()
                .historyId(history.getId())
                .keywordSummary(history.getKeywordSummary())
                .songs(history.getSongs().stream()
                        .map(MusicRecommendSongDTO::fromEntity)
                        .toList())
                .build();
    }
}
