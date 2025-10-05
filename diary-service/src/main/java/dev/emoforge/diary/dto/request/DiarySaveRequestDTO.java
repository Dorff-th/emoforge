package dev.emoforge.diary.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class DiarySaveRequestDTO {
    private LocalDate diaryDate;         // 회고 날짜
    private int emotionScore;            // 감정 점수 (1~5)
    private List<String> habitTags;      // 오늘 완료한 습관 리스트
    private String feelingKo;            // 한글 감정 문장
    private String feelingEn;            // GPT 영어 문장
    private String content;              // 회고 본문
    private String feedback;             // GPT가 생성한 피드백
}

