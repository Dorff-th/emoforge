package dev.emoforge.auth.infra.kakao;

public record KakaoLoginResult(
        String status,      // LOGIN_OK / NEED_AGREEMENT
        String kakaoId,     // 신규회원 시 필요
        String nickname
) {}
