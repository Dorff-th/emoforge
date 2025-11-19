package dev.emoforge.diary.service;

import dev.emoforge.diary.dto.response.MemberDiaryStatsResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DiaryActivityStatsServiceTest {

    @Autowired
    private DiaryActivityStatsService statsService;

    @DisplayName("특정 사용자의 감정회고 개수, GPT 요약개수, 음악(유튜브영상) 추천 이력 개수 조회에 성공 한다.")
    @Test
    void testStats() {

        String memberUuid = "32b8b3a6-134f-48a5-a3bb-c6e33f988148";

        MemberDiaryStatsResponse response = statsService.getUserDiaryStats(memberUuid);
        System.out.println(response);
    }

}