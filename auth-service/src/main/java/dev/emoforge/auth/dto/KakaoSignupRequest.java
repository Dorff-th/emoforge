package dev.emoforge.auth.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class KakaoSignupRequest {

    @NotBlank
    private Long kakaoId;

    @NotBlank
    private String nickname;

    // email은 초기에는 랜덤 생성이지만, 후에 사용자 변경 가능
    @NotBlank
    private String email;
}
