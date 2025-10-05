package dev.emoforge.diary.service;


import dev.emoforge.diary.domain.DiaryEntry;
import dev.emoforge.diary.domain.GptSummary;
import dev.emoforge.diary.repository.DiaryEntryRepository;
import dev.emoforge.diary.repository.GptSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GptService {

    private final DiaryGptClient diaryGptClient;
    private final DiaryEntryRepository diaryEntryRepository;
    private final GptSummaryRepository gptSummaryRepository;


    /**
     * 사용자가 입력한 감정을 기반으로
     * GPT에게 짧고 자연스러운 영어 문장 예시를 요청한다.
     *
     * @param feelingKo 한국어 감정 표현
     * @return 영어 문장 예시 리스트 (3~5개)
     */
    public List<String> getFeelingSuggestions(String feelingKo) {
        String prompt = String.format("""
            사용자가 "%s" 라고 느꼈을 때,
            이를 짧고 일상적인 영어 문장으로 자연스럽게 표현한 예시를 3~5개 추천해줘.
            각 문장은 따로 줄바꿈해서 보여줘.
        """, feelingKo);

        String result = diaryGptClient.chat(prompt, GptRole.FEELING_TRANSLATOR);
        return Arrays.stream(result.split("\n"))
                .filter(line -> !line.trim().isEmpty())
                .map(String::trim)
                .collect(Collectors.toList());
    }

    //감정일기 피드백 메서드
    public String getDiaryFeedback(String content, String feedbackType) {
        String style = switch (feedbackType) {
            case "encourage" -> "[피드백 스타일: 따뜻하고 긍정적이며 응원하는 말투]";
            case "scold"     -> "[피드백 스타일: 엄격하고 직설적으로 지적하는 말투]";
            case "roast"     -> "[피드백 스타일: 유머를 섞어 가볍게 놀리면서 지적하는 말투]";
            case "coach"     -> "[피드백 스타일: 냉정하고 목표지향적인 조언자 말투]";
            case "random"    -> "[피드백 스타일: 랜덤 스타일]";
            case "default"   -> "[피드백 스타일: 무난한 말투]";
            default          -> "[피드백 스타일: 따뜻하고 응원하는 말투]";
        };

        String prompt = String.format("""
        아래 회고 내용을 %s로 피드백 해줘.
        회고: %s
        조건: 
        - 스타일에 맞춰 반드시 한두 문장만 줄 것
        - 스타일에 따라 말투가 명확하게 구분되어야 함
        - 지시된 스타일과 다르게 응답하면 안 됨
        """, style, content);

        log.info("\n --- prompt : " + prompt);

        return diaryGptClient.chat(prompt, GptRole.FEEDBACK_COACH);
    }

    public String generateAndSaveSummary(String memberUuid, LocalDate date) {
        // 1. 해당 날짜의 회고들 가져오기
        List<DiaryEntry> diaryList = diaryEntryRepository
                .findByMemberUuidAndDiaryDate(memberUuid, date);

        if (diaryList.isEmpty()) {
            throw new RuntimeException("회고가 없습니다.");
        }

        // 2. 회고 내용을 하나로 합치기
        String fullContent = diaryList.stream()
                .map(DiaryEntry::getContent)
                .collect(Collectors.joining("\n"));

        // 3. GPT 요청
        String prompt = String.format("%s에 작성한 회고입니다. 요약해 주세요.\n%s", date, fullContent);
        //String summary = diaryGptClient.requestSummary(prompt);
        String summary = diaryGptClient.chat(prompt, GptRole.DIARY_SUMMARIZER);

        // 4. DB 저장
        GptSummary entity = new GptSummary();
        entity.setMemberUuid(memberUuid);
        entity.setDiaryDate(date);
        entity.setSummary(summary);
        //entity.setDiaryEntryId(null); // 전체 요약은 null로

        gptSummaryRepository.save(entity);
        return summary;
    }


    @Transactional
    public String generateSummary(String memberUuid) {
        LocalDate today = LocalDate.now();

        DiaryEntry diary = diaryEntryRepository.findTopByMemberUuidAndDiaryDateOrderByCreatedAtDesc(memberUuid, today)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "오늘 회고가 없습니다."));

        String prompt = buildSummaryPrompt(diary);

        // 1. GPT 호출
        String gptResult = diaryGptClient.getSummaryFromGpt(prompt);

        // 2. GptSummary 저장 (기존 요약 있으면 업데이트)
        GptSummary summary = gptSummaryRepository.findByDiaryEntry(diary)
                .orElse(new GptSummary());

        summary.setDiaryEntry(diary);
        summary.setSummary(gptResult);

        gptSummaryRepository.save(summary);
        return gptResult;
    }

    @Transactional
    public String generateFeedback(String memberUuid) {
        LocalDate today = LocalDate.now();

        DiaryEntry diary = diaryEntryRepository.findTopByMemberUuidAndDiaryDateOrderByCreatedAtDesc(memberUuid, today)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"오늘 회고가 없습니다."));

        String prompt = buildFeedbackPrompt(diary);

        String gptFeedback = diaryGptClient.getFeedbackFromGpt(prompt);

        diary.setFeedback(gptFeedback);
        diaryEntryRepository.save(diary);

        return gptFeedback;
    }

    private String buildSummaryPrompt(DiaryEntry diary) {
        return String.format(
                "다음은 하루의 감정일기입니다:\n\n%s\n\n이를 한 문단으로 요약해 주세요. 핵심 감정과 주요 사건을 중심으로 부드럽게 정리해 주세요.",
                diary.getContent()
        );
    }

    private String buildFeedbackPrompt(DiaryEntry diary) {
        String habits = String.join(", ", diary.getHabitTags());

        return String.format("""
        오늘 사용자가 작성한 회고입니다:
        
        감정 점수: %d
        오늘의 기분 한마디: %s
        오늘 실천한 습관: %s
        감정일기: %s
        
        이 내용을 바탕으로 사용자를 격려하거나 동기를 줄 수 있는 짧은 피드백 메시지를 작성해 주세요. 
        너무 길지 않고 따뜻한 느낌으로 부탁합니다.
        """,
                diary.getEmotion(),
                diary.getFeelingKo(),
                habits,
                diary.getContent()
        );
    }

}
