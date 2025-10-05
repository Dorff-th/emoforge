package dev.emoforge.diary.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.domain.GptSummary;
import dev.emoforge.diary.dto.page.PageRequestDTO;
import dev.emoforge.diary.dto.page.PageResponseDTO;
import dev.emoforge.diary.dto.request.DiarySaveRequestDTO;
import dev.emoforge.diary.dto.response.DiaryEntryDTO;
import dev.emoforge.diary.dto.response.DiaryGroupPageResponseDTO;
import dev.emoforge.diary.dto.response.DiaryGroupResponseDTO;
import dev.emoforge.diary.repository.DiaryEntryRepository;
import dev.emoforge.diary.repository.GptSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class DiaryEntryService {

    private final DiaryEntryRepository diaryEntryRepository;
    private final GptSummaryRepository gptSummaryRepository;
    private final ObjectMapper objectMapper;

    public PageResponseDTO<DiaryEntryDTO> getDiarySummaries(String memberUuid, PageRequestDTO requestDTO) {

        Pageable pageable = PageRequest.of(
                requestDTO.getPage() - 1,
                requestDTO.getSize(),
                Sort.by(Sort.Direction.DESC, "diaryDate")
        );

        Page<DiaryEntry> result = diaryEntryRepository.findByMemberUuid(memberUuid, pageable);

        List<DiaryEntryDTO> dtoList = result.getContent().stream()
                .map(DiaryEntryDTO::fromEntity)
                .toList();

        return new PageResponseDTO<>(requestDTO, result.getTotalElements(), dtoList, 10);
    }

    public DiaryGroupPageResponseDTO getDiaryListGroupedByDate(String memberUuid, Pageable pageable) {

        // ✅ 정렬 강제 적용
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "diaryDate")
        );

        // 1. 회고 목록 조회 (페이징)
        Page<DiaryEntry> page = diaryEntryRepository.findByMemberUuid(memberUuid, sortedPageable);
        List<DiaryEntry> entries = page.getContent();

        // 2. 날짜 기준 그룹화
        Map<LocalDate, List<DiaryEntry>> grouped = entries.stream()
                .collect(Collectors.groupingBy(DiaryEntry::getDiaryDate));

        // 3. 날짜별로 GPT 요약 붙여서 DTO 변환
        List<DiaryGroupResponseDTO> groupedList = grouped.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<DiaryEntry> dailyEntries = entry.getValue();

                    Optional<GptSummary> summaryOpt = gptSummaryRepository
                            .findFirstByMemberUuidAndDiaryDateAndDiaryEntryIdIsNull(memberUuid, date);
                    String summary = summaryOpt.map(GptSummary::getSummary).orElse(null);

                    List<DiaryEntryDTO> entryDTOs = dailyEntries.stream()
                            .map(DiaryEntryDTO::fromEntity)
                            .collect(Collectors.toList());

                    return DiaryGroupResponseDTO.builder()
                            .date(date)
                            .summary(summary)
                            .entries(entryDTOs)
                            .build();
                })
                .sorted(Comparator.comparing(DiaryGroupResponseDTO::getDate).reversed()) // 최신순
                .collect(Collectors.toList());

        // 4. 최종 응답 포맷
        return DiaryGroupPageResponseDTO.builder()
                .content(groupedList)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .isLast(page.isLast())
                .build();
    } // method end

    //선택한 연월 DiaryEntry 조회하기
    public List<DiaryGroupResponseDTO> getEntriesForMonthlyGroupedByDate(String memberUuid, LocalDate yearMonth) {

        LocalDate startDate = yearMonth.withDayOfMonth(1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // 1. 회고 목록 조회 (월별)
        List<DiaryEntry> diaryEntries = diaryEntryRepository.findByMemberUuidAndDiaryDateBetweenOrderByDiaryDateAsc(memberUuid, startDate, endDate);

        //diaryEntries.forEach(diaryEntry -> System.out.println(diaryEntry.getDiaryDate()));

        // 2. 날짜 기준 그룹화
        Map<LocalDate, List<DiaryEntry>> grouped =
                diaryEntries.stream().collect(Collectors.groupingBy(
                        DiaryEntry::getDiaryDate,
                        TreeMap::new,  // ✅ 오름차순 정렬
                        Collectors.toList()
                ));


        // 3. 날짜별로 GPT 요약 붙여서 DTO 변환
        List<DiaryGroupResponseDTO> groupedList = grouped.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<DiaryEntry> dailyEntries = entry.getValue();

                    Optional<GptSummary> summaryOpt = gptSummaryRepository
                            .findFirstByMemberUuidAndDiaryDateAndDiaryEntryIdIsNull(memberUuid, date);
                    String summary = summaryOpt.map(GptSummary::getSummary).orElse(null);

                    List<DiaryEntryDTO> entryDTOs = dailyEntries.stream()
                            .map(DiaryEntryDTO::fromEntity)
                            .collect(Collectors.toList());

                    return DiaryGroupResponseDTO.builder()
                            .date(date)
                            .summary(summary)
                            .entries(entryDTOs)
                            .build();
                })
                .collect(Collectors.toList());

        return groupedList;

    }

    public void saveDiary(String memberUuid, DiarySaveRequestDTO dto) throws JsonProcessingException {

        String habitJson = objectMapper.writeValueAsString(dto.getHabitTags());

        LocalDate today = LocalDate.now();
        log.debug("\n\n--=====diary save today : " + today);

        DiaryEntry entry = DiaryEntry.builder()
                .memberUuid(memberUuid)
                .diaryDate(today)       // 클라이언트의 new Date() 를 받아오는것이 아닌 서버에서 오늘날짜를 직접생성
                .emotion(dto.getEmotionScore())
                .habitTags(habitJson)
                .feelingKo(dto.getFeelingKo())
                .feelingEn(dto.getFeelingEn())
                .content(dto.getContent())
                .feedback(dto.getFeedback())
                .build();

        diaryEntryRepository.save(entry);
    }


} // class end