package dev.emoforge.auth_service;

import dev.emoforge.auth.AuthServiceApplication;
import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.enums.MemberStatus;
import dev.emoforge.auth.enums.Role;
import dev.emoforge.auth.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

@SpringBootTest(classes = AuthServiceApplication.class)
class MemberTestDataInitializer {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void insertTestMembers() {
        for (int i = 1; i <= 3; i++) {
            String username = String.format("user%d@test.com", i);
            Member member = Member.builder()
                    .uuid(UUID.randomUUID().toString())
                    .username(username)
                    .password(passwordEncoder.encode("test1234"))
                    .email(username)
                    .nickname("User" + i)
                    .role(Role.USER)
                    .status(MemberStatus.ACTIVE)
                    .build();

            memberRepository.save(member);
        }
    }
}
