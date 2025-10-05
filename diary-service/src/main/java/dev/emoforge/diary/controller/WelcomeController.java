package dev.emoforge.diary.controller;

import dev.emoforge.diary.service.GptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/diary/welcome")
@RequiredArgsConstructor
public class WelcomeController {

    final private GptService gptService;

    @GetMapping
    public String welcome() {
        return "Diary-Service is running!";
    }

    @GetMapping("/jwt")
    public String testJwt(Authentication authentication) {
        return "Diary-Service : JWT member_uuid = " + authentication.getPrincipal();
    }

    //오늘 기분 영문 피드백 테스트
    @GetMapping("/get-feeling-test")
    public List<String> getFeelingTest(@RequestParam("feelingKo") String feelingKo) {
        return  gptService.getFeelingSuggestions(feelingKo);

    }

    //감정회고 피드백 테스트 - 파라미터 없이 그냥 하드코딩값 으로만 확인
    @GetMapping("/get-diary-feedback-test")
    public String getDiaryFeedbackTest() {
        String content = "비도 오고 날도 꾸리꾸리하고 마음은 우울하다.";
        String feedbackType = "random";
        return gptService.getDiaryFeedback(content, feedbackType);
    }
}
