package dev.emoforge.diary.controller;


import dev.emoforge.diary.dto.request.GptFeedbackRequest;
import dev.emoforge.diary.dto.request.GptFeelingRequest;
import dev.emoforge.diary.dto.response.GptFeedbackResponse;
import dev.emoforge.diary.dto.response.GptFeelingResponse;
import dev.emoforge.diary.service.GptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 *  해당 Controller는 Python FastAPI 로 대채함.
 */
//@RestController
//@RequestMapping("/api/diary/gpt")
@RequiredArgsConstructor
public class GptController {

    private final GptService gptService;

    //메뉴 : 회고 쓰기 > 오늘의 기분한마디 (한글로) GPT 추천 버튼 Click
    @PostMapping("/feeling")
    public ResponseEntity<GptFeelingResponse> getFeelingSuggestions(@RequestBody GptFeelingRequest request) {
        List<String> suggestions = gptService.getFeelingSuggestions(request.getFeelingKo());
        return ResponseEntity.ok(new GptFeelingResponse(suggestions));
    }

    //메뉴 : 회고 쓰기 > 가장 하단 저장 Btn Click 시 실행되는 GPT 피드백 생성
    @PostMapping("/feedback")
    public ResponseEntity<GptFeedbackResponse> generateFeedback(@RequestBody GptFeedbackRequest request) {
        String result = gptService.getDiaryFeedback(request.getContent(), request.getFeedbackType());
        return ResponseEntity.ok(new GptFeedbackResponse(result));
    }

    //추후 다시 개선 - UserHomePage(Summry)에서 회고요약 버튼 누르면 회고요약 기능이 실행
   /* @PostMapping("/summary-feedback")
    public Map<String, String> generateFeedback(Authentication authentication) {
        String memberUuid = authentication.toString();
        String feedback = gptService.generateFeedback(memberUuid);
        return Map.of("feedback", feedback);
    }*/



}

