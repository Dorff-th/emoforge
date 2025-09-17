package dev.emoforge.auth.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.enums.MemberStatus;
import dev.emoforge.auth.enums.Role;
import dev.emoforge.auth.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Member saveIfNotExist(Long kakaoId, String nickname) {
        return memberRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> {
                    // 카카오로 부터 보안상 이메일 사용 불가 시 dummy 생성
                    String username = "kakao_" + UUID.randomUUID().toString().substring(0, 8) + "@dummy.local";

                    String randomPassword = UUID.randomUUID().toString();
                    String encoded = passwordEncoder.encode(randomPassword);

                    Member newMember = Member.builder()
                            .username(username)
                            .email(username)
                            .nickname(nickname)
                            .kakaoId(kakaoId)
                            .password(encoded)
                            .role(Role.USER)
                            .status(MemberStatus.ACTIVE)
                            .build();
                    return memberRepository.save(newMember);
                });
    }
}
