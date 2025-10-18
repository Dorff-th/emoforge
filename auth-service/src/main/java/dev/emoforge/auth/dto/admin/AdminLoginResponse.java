package dev.emoforge.auth.dto.admin;

/**
 * 관리자 로그인 응답 DTO
 * - 쿠키에 JWT를 심어주더라도, 프런트에서 상태 처리를 위해 메시지/만료시간을 내려주면 편함
 */
public record AdminLoginResponse(
        String message,
        long expiresInSeconds
) {}
