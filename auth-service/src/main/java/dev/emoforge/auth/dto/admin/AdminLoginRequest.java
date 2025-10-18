package dev.emoforge.auth.dto.admin;

import jakarta.validation.constraints.NotBlank;

/**
 * 관리자 로그인 요청 DTO
 * - 캡챠 사용 시 captchaToken에 reCAPTCHA 토큰(또는 자체 캡챠 응답값) 전달
 */
public record AdminLoginRequest(
        @NotBlank String username,
        @NotBlank String password,
        String captchaToken
) {}
