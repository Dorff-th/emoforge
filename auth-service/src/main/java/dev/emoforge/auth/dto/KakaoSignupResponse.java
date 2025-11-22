package dev.emoforge.auth.dto;

import lombok.Builder;

@Builder
public record KakaoSignupResponse(
        String status,
        String uuid,
        String nickname
) {}
