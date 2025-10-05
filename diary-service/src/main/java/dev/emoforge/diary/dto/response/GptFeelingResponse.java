package dev.emoforge.diary.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/*
사용자가 한글로 입력한 오늘의 기분을
GPT가 영어로 몇개의 추천 문장을 반환하는 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GptFeelingResponse {
    private List<String> suggestions; // 추천된 영어 표현들
}
