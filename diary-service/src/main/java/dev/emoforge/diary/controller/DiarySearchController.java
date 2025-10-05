package dev.emoforge.diary.controller;


import dev.emoforge.diary.dto.request.DiarySearchRequestDTO;
import dev.emoforge.diary.dto.response.DiarySearchResultDTO;
import dev.emoforge.diary.service.DiarySearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dairy/search")
@RequiredArgsConstructor
@Slf4j
public class DiarySearchController {

    private final DiarySearchService diarySearchService;


    //상단 Header 검색 입력하고 나오는 결과 또는 검색결과 페이지에서 검색 Btn Click
    @PostMapping
    public Page<DiarySearchResultDTO> search(Authentication authentication,
                                             @RequestBody DiarySearchRequestDTO request, Pageable pageable) {

        String memberUuid = authentication.getPrincipal().toString();
        request.setMemberUuid(memberUuid);

        log.info(request.toString());

        return diarySearchService.search(memberUuid, request, pageable);
    }
}
