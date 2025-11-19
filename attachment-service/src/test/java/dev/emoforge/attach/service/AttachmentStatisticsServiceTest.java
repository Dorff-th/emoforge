package dev.emoforge.attach.service;

import dev.emoforge.attach.domain.UploadType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

@SpringBootTest
class AttachmentStatisticsServiceTest   {

    @Autowired
    private AttachmentStatsService statisticsService;

    @DisplayName("특정 사용자의 대한 업로드 유형별 첨부파일 개수를 조회하는데 성공한다.")
    @Test
    public void testAttachmentStat() {
        String memberUuid = "32b8b3a6-134f-48a5-a3bb-c6e33f988148";
        Map<UploadType, Long> attachmentStat = statisticsService.getUserAttachmentCounts(memberUuid);
        System.out.println(attachmentStat);
    }
}