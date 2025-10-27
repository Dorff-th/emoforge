package dev.emoforge.post.dto.internal;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record SearchFilterDTO(
        String keyword,
        Boolean titleChecked,
        Boolean contentChecked,
        Boolean commentChecked,
        Long categoryId,
        LocalDate startDate,
        LocalDate endDate,
        List<String> searchFields
) {
}
