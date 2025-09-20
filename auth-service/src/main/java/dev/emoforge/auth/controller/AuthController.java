package dev.emoforge.auth.controller;

import dev.emoforge.auth.dto.LoginRequest;
import dev.emoforge.auth.dto.LoginResponse;
import dev.emoforge.auth.dto.MemberDTO;
import dev.emoforge.auth.dto.SignUpRequest;
import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.repository.MemberRepository;
import dev.emoforge.auth.security.CustomUserPrincipal;
import dev.emoforge.auth.service.AuthService;
import dev.emoforge.auth.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/signup")
    public ResponseEntity<Member> signUp(@Valid @RequestBody SignUpRequest request) {
        Member member = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public MemberDTO getCurrentUser(@AuthenticationPrincipal CustomUserPrincipal user) {
        if (user == null ) {
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }
        String uuid = user.getUuid();

        Member member = memberRepository.findByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));;

        return new MemberDTO(member);
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }

        // ✅ refresh_token 안에 담긴 UUID 꺼냄
        String memberUuid = jwtTokenProvider.getClaims(refreshToken).get("uuid", String.class);
        Member member = memberRepository.findByUuid(memberUuid)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // 새 토큰 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(
                member.getUsername(), member.getRole().name(), member.getUuid()
        );
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(
                member.getUsername(), member.getUuid()
        );

        // ✅ 쿠키 다시 세팅
        ResponseCookie accessCookie = ResponseCookie.from("access_token", newAccessToken)
                .httpOnly(true)
                .secure(false) // 운영은 true
                //.sameSite("None")
                .domain(".127.0.0.1.nip.io")
                .path("/")
                .maxAge(Duration.ofHours(1))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(false)
                //.sameSite("None")
                .domain(".127.0.0.1.nip.io")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok("Token refreshed");
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {

        // (옵션) 세션 무효화 - OAuth2Login 사용 시 잔여 세션 끊기
        var session = request.getSession(false);
        if (session != null) session.invalidate();

        // 1) 과거에 '.127.0.0.1.nip.io' 로 발급된 토큰 쿠키 제거 (옵션 동일)
        response.addHeader("Set-Cookie",
                ResponseCookie.from("access_token", "")
                        .domain(".127.0.0.1.nip.io") // 생성과 완전히 동일
                        .path("/")
                        .httpOnly(true)
                        .sameSite("Lax")
                        .secure(false)               // dev
                        .maxAge(0)                   // 즉시 만료
                        .build().toString()
        );
        response.addHeader("Set-Cookie",
                ResponseCookie.from("refresh_token", "")
                        .domain(".127.0.0.1.nip.io")
                        .path("/")
                        .httpOnly(true)
                        .sameSite("Lax")
                        .secure(false)
                        .maxAge(0)
                        .build().toString()
        );

        // 2) 혹시 모르는 변형들(호스트 전용/도메인 미지정)도 함께 정리
        response.addHeader("Set-Cookie",
                ResponseCookie.from("access_token", "")
                        .path("/")
                        .httpOnly(true)
                        .sameSite("Lax")
                        .secure(false)
                        .maxAge(0)
                        .build().toString()
        );
        response.addHeader("Set-Cookie",
                ResponseCookie.from("refresh_token", "")
                        .path("/")
                        .httpOnly(true)
                        .sameSite("Lax")
                        .secure(false)
                        .maxAge(0)
                        .build().toString()
        );

        // 3) JSESSIONID도 끊기 (OAuth2Login 세션 잔여 대비)
        response.addHeader("Set-Cookie",
                ResponseCookie.from("JSESSIONID", "")
                        .path("/")
                        .maxAge(0)
                        .build().toString()
        );

        return ResponseEntity.noContent().build();
    }
}
