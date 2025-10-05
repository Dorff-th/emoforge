package dev.emoforge.diary.dto.response;


import dev.emoforge.diary.domain.DiaryEntry;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@ToString
public class DiaryEntryDTO {

    private Long id;
    private String content;
    private int emotion;

    private String feedback;
    private String feelingKo;
    private String feelingEn;

    private List<String> habitTags;

    private LocalDateTime createdAt;

    // 👉 Entity → DTO 변환용 static 메서드
    public static DiaryEntryDTO fromEntity(DiaryEntry entity) {
        return DiaryEntryDTO.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .emotion(entity.getEmotion())
                .feedback(entity.getFeedback())
                .feelingKo(entity.getFeelingKo())
                .feelingEn(entity.getFeelingEn())
                .habitTags(convertHabitTags(entity.getHabitTags()))
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private static List<String> convertHabitTags(String habitTagsRaw) {
        if (habitTagsRaw == null || habitTagsRaw.isBlank()) return List.of();
        return List.of(habitTagsRaw.split(","));
    }
}
