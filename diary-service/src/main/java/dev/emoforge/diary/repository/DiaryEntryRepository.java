package dev.emoforge.diary.repository;


import dev.emoforge.diary.domain.DiaryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {

    @EntityGraph(attributePaths = {"gptSummary"})
    Page<DiaryEntry> findByMemberUuid(String memberUuid, Pageable pageable);

    //연월 범위로 조회
    List<DiaryEntry> findByMemberUuidAndDiaryDateBetweenOrderByDiaryDateAsc(String memberUuid, LocalDate startDate, LocalDate endDate);

    List<DiaryEntry> findByMemberUuidAndDiaryDate(String memberUuid, LocalDate date);

    List<DiaryEntry> findByMemberUuidAndDiaryDateBetween(String memberUuid, LocalDate startDate, LocalDate endDate);

    //Optional<DiaryEntry> findByMemberAndDiaryDate(Member member, LocalDate diaryDate);
    Optional<DiaryEntry> findTopByMemberUuidAndDiaryDateOrderByCreatedAtDesc(String memberUuid, LocalDate diaryDate);
}
