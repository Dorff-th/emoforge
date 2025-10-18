package dev.emoforge.auth.controller.admin;

import dev.emoforge.auth.dto.admin.AdminLoginRequest;
import dev.emoforge.auth.dto.admin.AdminLoginResponse;
import dev.emoforge.auth.service.admin.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {

        String token = adminAuthService.login(request);

        // ✅ HttpOnly 쿠키 설정
        ResponseCookie cookie = ResponseCookie.from("admin_token", token)
                .httpOnly(true)
                .secure(false)           // 배포 시 true
                .sameSite("Strict")
                .path("/")
                .maxAge(30 * 60)         // 30분
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
}
