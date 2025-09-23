package dev.emoforge.post.dto.internal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequestWrapper {
    private SearchFilterDTO searchFilterDTO;
    private PageRequestDTO pageRequestDTO;
}
