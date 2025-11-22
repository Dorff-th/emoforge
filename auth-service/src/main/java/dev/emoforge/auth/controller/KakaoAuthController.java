package dev.emoforge.auth.controller;

import dev.emoforge.auth.infra.kakao.KakaoCodeRequest;
import dev.emoforge.auth.infra.kakao.KakaoLoginResult;
import dev.emoforge.auth.service.KakaoAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Slf4j
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;

    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody KakaoCodeRequest request,
                                        HttpServletResponse response) {

        KakaoLoginResult result = kakaoAuthService.processKakaoLogin(request.code(), response);
        return ResponseEntity.ok(result);
    }
}
