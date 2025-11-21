package dev.emoforge.auth.service;

import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.repository.MemberRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MemberWithdrawalServiceTest {

    @Autowired
    private MemberWithdrawalService service;

    @Autowired
    private MemberRepository repository;

    @DisplayName("특정 회원의 탈퇴신청 실행에 성공한다.")
    @Test
    void testRequestWithdrawal() {
        String memberUuid = "0f112339-7efe-4b4b-b9ea-a00d8a770946";

        service.requestWithdrawal(memberUuid);

        Member member = repository.findByUuid(memberUuid).orElseThrow(()->new IllegalArgumentException("존재하지 않는 회원입니다."));

        System.out.println("\n\n\nmember's deleted : " + member.isDeleted());
        System.out.println("member's deletedAt : " + member.getDeletedAt());

    }

    @DisplayName("특정 회원의 탈퇴신청 취소 실행에 성공한다.")
    @Test
    void testCancelWithdrawal() {
        String memberUuid = "0f112339-7efe-4b4b-b9ea-a00d8a770946";
        service.cancelWithdrawal(memberUuid);
        Member member = repository.findByUuid(memberUuid).orElseThrow(()->new IllegalArgumentException("존재하지 않는 회원입니다."));
        System.out.println("\n\n\nmember's deleted : " + member.isDeleted());
        System.out.println("member's deletedAt : " + member.getDeletedAt());

    }

}