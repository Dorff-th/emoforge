package dev.emoforge.diary.dto.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyTrendDTO {
    private String weekLabel;  // 예: "07.01~07.07"
    private double averageEmotion;
}