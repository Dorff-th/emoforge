package dev.emoforge.diary.controller;


import dev.emoforge.diary.dto.response.GPTSummaryResponseDTO;
import dev.emoforge.diary.dto.response.SummaryResponseDTO;
import dev.emoforge.diary.service.SummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diary/summary")
@Slf4j
public class SummaryController {

    private final SummaryService summaryService;

    //메뉴 : 로그인 하면 바로나오는 첫화면 (개발 의도는 오늘하루 감정 요약인데 오늘 감정 최신 1개만 나오도록 변경)
    @GetMapping("/today")
    public SummaryResponseDTO getTodaySummary(Authentication authentication) {

        log.info("Controller 진입 성공");
        //return ResponseEntity.status(HttpStatus.NOT_FOUND).body("404 직접 리턴");
        String memberUuid = authentication.toString();
        return summaryService.getTodaySummary(memberUuid);
    }

    //메뉴 : 로그인 하면 바로나오는 첫화면의 오늘의 GPT 요약 조회 (gpt_summary)
    @GetMapping("/gpt/today")
    public GPTSummaryResponseDTO getTodayGptSummary(Authentication authentication) {

        String memberUuid = authentication.toString();

        return summaryService.getTodayGPTSummary(memberUuid);
    }
}
