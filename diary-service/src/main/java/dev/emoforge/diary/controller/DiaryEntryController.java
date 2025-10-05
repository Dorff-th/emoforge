package dev.emoforge.diary.controller;


import com.fasterxml.jackson.core.JsonProcessingException;

import dev.emoforge.diary.dto.request.DiarySaveRequestDTO;
import dev.emoforge.diary.dto.request.GPTSummaryRequestDTO;
import dev.emoforge.diary.dto.response.DiaryGroupPageResponseDTO;
import dev.emoforge.diary.dto.response.DiaryGroupResponseDTO;
import dev.emoforge.diary.dto.response.GPTSummaryResponseDTO;
import dev.emoforge.diary.service.DiaryEntryService;
import dev.emoforge.diary.service.GptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diary")
public class DiaryEntryController {

    private final DiaryEntryService diaryEntryService;
    private final GptService gptService;

    //메뉴 : 회고 목록
    @GetMapping("/diaries")
    public DiaryGroupPageResponseDTO getDiaryList(
            Authentication authentication,
            Pageable pageable
    ) {
        String memberUuid = authentication.getPrincipal().toString();
        return diaryEntryService.getDiaryListGroupedByDate(memberUuid, pageable);
    }


    //메뉴 : 회고 달력
    @GetMapping("/diaries/monthly")
    public List<DiaryGroupResponseDTO> getDiaryListMonthly(Authentication authentication,
                                                           @RequestParam("yearMonth") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate yearMonth) {

        String memberUuid = authentication.getPrincipal().toString();
        return diaryEntryService.getEntriesForMonthlyGroupedByDate(memberUuid, yearMonth);

    }

    //메뉴 : 회고 쓰기
    @PostMapping("/diaries")
    public ResponseEntity<Void> saveDiary(
            Authentication authentication,
            @RequestBody DiarySaveRequestDTO dto
    ) throws JsonProcessingException {

        String memberUuid = authentication.getPrincipal().toString();
        diaryEntryService.saveDiary(memberUuid, dto);
        return ResponseEntity.ok().build();
    }

    //메뉴 : 회고 달력 > 날짜 클릭 > GPT 요약생성 Btn Click (클릭한 날짜의 GPT 회고요약이 없을때만 버튼생성)
    @PostMapping("/gpt-summary")
    public ResponseEntity<GPTSummaryResponseDTO> generateSummary(
            Authentication authentication,
            @RequestBody GPTSummaryRequestDTO request
    ) {

        String memberUuid = authentication.getPrincipal().toString();

        String summary = gptService.generateAndSaveSummary(
                memberUuid,
                request.getDate()
        );

        return ResponseEntity.ok(new GPTSummaryResponseDTO(summary));
    }

}
