package dev.emoforge.diary.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryGroupResponseDTO {

    private LocalDate date;          // 날짜
    private String summary;          // GPT 하루 요약 (nullable)
    private List<DiaryEntryDTO> entries;  // 해당 날짜의 회고들
}
