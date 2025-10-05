package dev.emoforge.diary.controller;


import dev.emoforge.diary.dto.statistics.EmotionStatisticsDTO;
import dev.emoforge.diary.service.EmotionStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/diary/statistics/emotion")
@RequiredArgsConstructor
public class EmotionStatisticsController {

    private final EmotionStatisticsService emotionStatisticsService;

    @GetMapping
    public EmotionStatisticsDTO getEmotionStatistics(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication

    ) {
        String memberUuid = authentication.toString();
        return emotionStatisticsService.getEmotionStatistics(memberUuid, startDate, endDate);
    }
}
