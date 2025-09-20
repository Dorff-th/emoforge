package dev.emoforge.auth.dto;

import dev.emoforge.auth.entity.Member;
import lombok.Getter;

@Getter
public class MemberDTO {
    private final String uuid;
    private final String username;
    private final String email;
    private final String nickname;
    private final String role;
    private final String status;

    public MemberDTO(Member member) {
        this.uuid = member.getUuid();
        this.username = member.getUsername();
        this.email = member.getEmail();
        this.nickname = member.getNickname();
        this.role = member.getRole().name();
        this.status = member.getStatus().name();
    }
}
