package dev.emoforge.diary.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiaryGroupPageResponseDTO {
    private List<DiaryGroupResponseDTO> content; // 날짜별 그룹 리스트
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean isLast;
}

