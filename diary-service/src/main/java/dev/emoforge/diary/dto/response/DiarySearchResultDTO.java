package dev.emoforge.diary.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class DiarySearchResultDTO {
    private Long id;
    private LocalDate diaryDate;
    private String content;
    private String feelingKo;
    private String feelingEn;
    private String feedback;
    private int emotion;
    private LocalDateTime createdAt;
}
