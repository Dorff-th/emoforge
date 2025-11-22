package dev.emoforge.auth.controller;

import dev.emoforge.auth.dto.KakaoSignupRequest;
import dev.emoforge.auth.dto.KakaoSignupResponse;
import dev.emoforge.auth.service.KakaoSignupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/kakao")
public class KakaoSignupController {

    private final KakaoSignupService signupService;

    @PostMapping("/signup")
    public ResponseEntity<KakaoSignupResponse> signup(
            @RequestBody KakaoSignupRequest request
    ) {
        log.info("🆕 Kakao signup 요청: kakaoId={}, nickname={}",
                request.getKakaoId(), request.getNickname());

        var result = signupService.signupNewMember(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.accessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, result.refreshCookie().toString())
                .body(
                        KakaoSignupResponse.builder()
                                .status("SIGNED_UP")
                                .uuid(result.uuid())
                                .nickname(result.nickname())
                                .build()
                );
    }
}
