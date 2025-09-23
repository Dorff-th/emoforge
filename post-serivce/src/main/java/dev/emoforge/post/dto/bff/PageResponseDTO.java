package dev.emoforge.post.dto.bff;

import dev.emoforge.post.dto.internal.PageRequestDTO;
import lombok.Getter;

import java.util.List;

@Getter
public class PageResponseDTO<T> {

    private final int page;
    private final int size;
    private final int totalPages;
    private final long totalElements;
    private final int startPage;
    private final int endPage;
    private final boolean prev;
    private final boolean next;
    private final List<T> dtoList;

    public PageResponseDTO(PageRequestDTO requestDTO, long totalElements, List<T> dtoList, int pageCountToShow) {
        this.page = requestDTO.page();
        this.size = requestDTO.size();
        this.totalElements = totalElements;
        this.totalPages = (int) Math.ceil((double) totalElements / this.size);
        this.dtoList = dtoList;

        int blockSize = Math.max(pageCountToShow, 1);
        int currentPage = requestDTO.page();
        int tempEnd = (int) (Math.ceil(currentPage / (double) blockSize) * blockSize);
        this.startPage = tempEnd - (blockSize - 1);
        this.endPage = Math.min(tempEnd, totalPages);

        this.prev = this.startPage > 1;
        this.next = this.endPage < totalPages;
    }
}
