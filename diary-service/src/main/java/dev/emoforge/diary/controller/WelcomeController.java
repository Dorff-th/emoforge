package dev.emoforge.diary.controller;

import dev.emoforge.diary.service.GptService;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@Hidden
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


}
