package dev.emoforge.diary.dto.music;

import lombok.Data;

import java.util.List;

/**
 * 프런트엔드로 부터 diaryEntryId와, 사용자로 부터 입력받은 artistPreferences 입력받는 DTO
 */
@Data
public class MusicRecommendRequest {
    private Long diaryEntryId;
    private List<String> artistPreferences;
}