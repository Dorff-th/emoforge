package dev.emoforge.post.service.bff;

import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.bff.PostListItemResponse;
import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.PostSimpleDTO;
import dev.emoforge.post.repository.PostRepository;
import dev.emoforge.post.service.external.AttachClient;
import dev.emoforge.post.service.external.AuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostListFacade {

    private static final int PAGE_BLOCK_SIZE = 10;

    private final PostRepository postRepository;
    private final AttachClient attachClient;
    private final AuthClient authClient;

    public PageResponseDTO<PostListItemResponse> getPostList(PageRequestDTO requestDTO) {
        Pageable pageable = PageRequest.of(
            requestDTO.page() - 1,
            requestDTO.size(),
            Sort.by(Sort.Direction.valueOf(requestDTO.direction().toString()), requestDTO.sort())
        );

        Page<PostSimpleDTO> posts = postRepository.findAllPosts(pageable);
        List<PostSimpleDTO> dtoList = posts.getContent();
        if (dtoList.isEmpty()) {
            return new PageResponseDTO<>(requestDTO, posts.getTotalElements(), List.of(), PAGE_BLOCK_SIZE);
        }

        List<Long> postIds = dtoList.stream().map(PostSimpleDTO::id).toList();
        Map<Long, Integer> attachCounts = postIds.isEmpty()
            ? Collections.emptyMap()
            : attachClient.countByPostIds(postIds);

        Map<String, String> nicknameCache = new HashMap<>();
        List<PostListItemResponse> responses = dtoList.stream()
            .map(post -> {
                String nickname = nicknameCache.computeIfAbsent(
                    post.memberUuid(),
                    uuid -> authClient.getMemberProfile(uuid).nickname()
                );
                return new PostListItemResponse(
                    post.id(),
                    post.title(),
                    post.createdAt(),
                    post.categoryName(),
                    nickname,
                    post.commentCount(),
                    attachCounts.getOrDefault(post.id(), 0)
                );
            })
            .toList();

        return new PageResponseDTO<>(requestDTO, posts.getTotalElements(), responses, PAGE_BLOCK_SIZE);
    }
}