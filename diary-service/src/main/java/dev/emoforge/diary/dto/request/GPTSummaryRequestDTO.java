package dev.emoforge.diary.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class GPTSummaryRequestDTO {
    private LocalDate date;
}
