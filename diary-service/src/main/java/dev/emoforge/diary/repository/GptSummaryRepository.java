package dev.emoforge.diary.repository;


import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.domain.GptSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface GptSummaryRepository extends JpaRepository<GptSummary, Long> {

    /**
     * 특정 날짜에 해당하는 하루 전체 요약을 조회한다.
     * (diary_entry_id가 null인 경우만 해당 → 하루 전체 요약임)
     */
    Optional<GptSummary> findFirstByMemberUuidAndDiaryDateAndDiaryEntryIdIsNull(String memberUuid, LocalDate diaryDate);

    Optional<GptSummary> findByDiaryEntry(DiaryEntry diaryEntry);

    //특정날짜 (예 오늘날짜)의 Gpt회고 요약만 조회하기
    Optional<GptSummary> findByMemberUuidAndDiaryDate(String memberUuid, LocalDate diaryDate);
}
