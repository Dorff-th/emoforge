package dev.emoforge.diary.controller;


import dev.emoforge.diary.dto.response.GPTSummaryResponseDTO;
import dev.emoforge.diary.dto.response.SummaryResponseDTO;
import dev.emoforge.diary.service.SummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diary/summary")
@Slf4j
public class SummaryController {

    private final SummaryService summaryService;

    //메뉴 : 로그인 하면 바로나오는 첫화면 (개발 의도는 오늘하루 감정 요약인데 오늘 감정 최신 1개만 나오도록 변경)
    @GetMapping("/today")
    public ResponseEntity<SummaryResponseDTO> getTodaySummary(Authentication authentication) {

        String memberUuid = authentication.getPrincipal().toString();
        log.info("✅ SummaryService 진입: memberUuid={}", memberUuid);

        log.debug(memberUuid);

        try {
            SummaryResponseDTO entry =  summaryService.getTodaySummary(memberUuid);
            return ResponseEntity.ok(entry);
        } catch (Exception e) {
            log.error("❌ SummaryService 예외 발생: {}", e.getMessage(), e);
            throw e;
        }

    }


    //메뉴 : 로그인 하면 바로나오는 첫화면의 오늘의 GPT 요약 조회 (gpt_summary)
    @GetMapping("/gpt/today")
    public ResponseEntity<GPTSummaryResponseDTO> getTodayGptSummary(Authentication authentication) {

        String memberUuid = authentication.getPrincipal().toString();
        var result = summaryService.getTodayGPTSummary(memberUuid);
        return ResponseEntity.ok(result);
    }
}
