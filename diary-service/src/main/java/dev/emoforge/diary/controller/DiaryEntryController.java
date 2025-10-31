package dev.emoforge.diary.controller;


import com.fasterxml.jackson.core.JsonProcessingException;

import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.dto.request.DiarySaveRequestDTO;
import dev.emoforge.diary.dto.request.GPTSummaryRequestDTO;
import dev.emoforge.diary.dto.response.DiaryGroupPageResponseDTO;
import dev.emoforge.diary.dto.response.DiaryGroupResponseDTO;
import dev.emoforge.diary.dto.response.GPTSummaryResponseDTO;
import dev.emoforge.diary.repository.DiaryEntryRepository;
import dev.emoforge.diary.repository.GptSummaryRepository;
import dev.emoforge.diary.service.DiaryEntryService;
import dev.emoforge.diary.service.GptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diary")
@Slf4j
public class DiaryEntryController {

    private final DiaryEntryService diaryEntryService;
    private final GptService gptService;
    private final DiaryEntryRepository diaryEntryRepository;
    private final GptSummaryRepository gptSummaryRepository;

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

    /**
     * ✅ 회고 1건 삭제
     * @param diaryEntryId 삭제할 회고 ID
     * @param withSummary  true → GPT 요약도 함께 삭제
     */
    @DeleteMapping("/{diaryEntryId}")
    public ResponseEntity<?> deleteDiaryEntry(
            @PathVariable("diaryEntryId") Long diaryEntryId,
            @RequestParam(name = "withSummary", defaultValue = "false") boolean withSummary,
            Authentication authentication) {

        // 1️⃣ 인증 정보에서 uuid 추출
        String currentUuid = (String) authentication.getPrincipal();

        // 2️⃣ DB에서 회고 조회
        DiaryEntry target = diaryEntryRepository.findById(diaryEntryId)
                .orElseThrow(() -> new IllegalArgumentException("회고를 찾을 수 없습니다."));

        // 3️⃣ 현재 사용자와 회고 작성자 일치 여부 확인
        if (!target.getMemberUuid().equals(currentUuid)) {
            log.warn("❌ 삭제 권한 없음: memberUuid={}, currentUuid={}",
                    target.getMemberUuid(), currentUuid);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("삭제 권한이 없습니다.");
        }

        log.debug("✅ 회고(ID={}) 삭제 완료 by {}", diaryEntryId, currentUuid);


        diaryEntryService.deleteDiaryEntry(diaryEntryId, withSummary);

        return ResponseEntity.ok().body(
                String.format("회고(ID=%d)가 삭제되었습니다. (GPT 요약 삭제 여부: %s)",
                        diaryEntryId, withSummary ? "포함" : "미포함")
        );
    }

    @DeleteMapping("/summary")
    public ResponseEntity<?> deleteSummaryOnly(
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {

        log.debug("\n\n\n====/summary 실행");

        String currentUuid = (String) authentication.getPrincipal();
        gptSummaryRepository.deleteByMemberUuidAndDiaryDate(currentUuid, date);

        return ResponseEntity.ok().body(
                String.format("회원 %s의 %s GPT 요약이 삭제되었습니다.", currentUuid, date)
        );
    }

    /**
     * ✅ 특정 날짜의 회고 전체 삭제
     * @param authentication  사용자 UUID
     * @param date        YYYY-MM-DD 형식의 날짜
     */
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllByDate(
            @RequestParam("date") LocalDate date,
            Authentication authentication) {

        // 1️⃣ 인증된 사용자 UUID 추출
        String currentUuid = (String) authentication.getPrincipal();

        // 2️⃣ 그 사용자의 해당 날짜 회고 전체 삭제
        diaryEntryService.deleteAllByDate(currentUuid, date);

        // 3️⃣ 로깅
        log.info("✅ 회원 {}의 {} 회고 및 GPT 요약이 모두 삭제되었습니다.", currentUuid, date);

        // 4️⃣ 응답 반환
        return ResponseEntity.ok().body(
                String.format("회원 %s의 %s 회고 및 GPT 요약이 모두 삭제되었습니다.", currentUuid, date)
        );
    }

}
