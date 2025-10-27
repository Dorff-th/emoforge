package dev.emoforge.post.dto.internal;

import lombok.Builder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Builder
public record PageRequestDTO(
        int page,
        int size,
        String sort,
        SortDirection direction
) {
    public PageRequestDTO {
        if (page < 1) {
            page = 1;
        }
        if (size <= 0) {
            size = 10;
        }
        if (sort == null || sort.isBlank()) {
            sort = "id";
        }
        if (direction == null) {
            direction = SortDirection.DESC;
        }
    }

    public Pageable toPageable() {
        return PageRequest.of(page - 1, size, Sort.by(direction.toSpringDirection(), sort));
    }

    public int offset() {
        return (page - 1) * size;
    }
}
