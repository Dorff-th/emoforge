package dev.emoforge.auth.controller.admin;

import dev.emoforge.auth.dto.admin.AdminLoginRequest;
import dev.emoforge.auth.dto.admin.AdminLoginResponse;
import dev.emoforge.auth.security.jwt.JwtTokenProvider;
import dev.emoforge.auth.service.admin.AdminAuthService;
import dev.emoforge.auth.service.admin.RecaptchaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 관리자 로그인 컨트롤러
 * - Auth-Service 내부 전용 엔드포인트 (/api/auth/admin)
 * - JWT는 HttpOnly 쿠키(admin_token)에 담아 반환
 */
@RestController
@RequestMapping("/api/auth/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final RecaptchaService recaptchaService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {

        // ✅ 1. reCAPTCHA 토큰 유효성 검증
        if (!recaptchaService.verify(request.captchaToken())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AdminLoginResponse("reCAPTCHA 검증 실패", 0));
        }

        // ✅ 2. 로그인 시도
        String token = adminAuthService.login(request);

        // ✅ 3. 쿠키 설정
        ResponseCookie cookie = ResponseCookie.from("admin_token", token)
                .httpOnly(false)
                .secure(false)           // 배포 시 true
                //.sameSite("Strict")
                .domain(".127.0.0.1.nip.io") // ✅ 모든 서브도메인 공유
                .path("/")
                .maxAge(30 * 60)
                .build();

        AdminLoginResponse response = new AdminLoginResponse("관리자 로그인 성공", 1800);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // ✅ 쿠키 삭제
        ResponseCookie deleteCookie = ResponseCookie.from("admin_token", "")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getAdminInfo(Authentication authentication) {
        //Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "인증되지 않았습니다."));
        }

        // JwtTokenProvider에서 사용자 정보 추출
        System.out.println("\n\n\nauthentication : " +  authentication.toString());
        String username = authentication.getName();
        System.out.println("username : " + username);
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        System.out.println("role : " + role);

        return ResponseEntity.ok(Map.of(
                "username", username,
                "role", role,
                "message", "관리자 인증 성공"
        ));
    }
}
