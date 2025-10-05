package dev.emoforge.diary.dto.response;

import java.time.LocalDate;

public record SummaryResponseDTO(
        LocalDate diaryDate,
        int emotion,
        String feelingKo,
        String feelingEn,
        String habitTags,
        String content,
        String summary,
        String feedback
) {}
