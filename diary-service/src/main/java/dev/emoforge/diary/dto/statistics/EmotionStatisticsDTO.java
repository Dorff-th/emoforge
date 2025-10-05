package dev.emoforge.diary.dto.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmotionStatisticsDTO {

    private double averageEmotion;

    private Map<Integer, Long> emotionFrequency;

    private List<WeeklyTrendDTO> weeklyTrend;

    private Map<DayOfWeek, Double> dayOfWeekAverage;
}
