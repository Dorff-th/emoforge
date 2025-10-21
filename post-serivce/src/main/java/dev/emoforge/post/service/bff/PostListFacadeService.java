package dev.emoforge.post.service.bff;

import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.bff.PostListItemResponse;
import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.PostSimpleDTO;
import dev.emoforge.post.repository.PostRepository;
import dev.emoforge.post.service.external.AttachClient;
import dev.emoforge.post.service.external.AuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PostListFacadeService {

    private static final int PAGE_BLOCK_SIZE = 10;

    private final PostRepository postRepository;
    private final AttachClient attachClient;
    private final AuthClient authClient;

    public PageResponseDTO<PostListItemResponse> getPostList(String tagName, PageRequestDTO requestDTO) {

        Pageable pageable = PageRequest.of(
            requestDTO.page() - 1,
            requestDTO.size(),
            Sort.by(Sort.Direction.valueOf(requestDTO.direction().toString()), requestDTO.sort())
        );

        Page<PostSimpleDTO> posts = (tagName == null)
            ? postRepository.findAllPosts(pageable)
            : postRepository.findAllPostsByTag(tagName, pageable);

        List<PostSimpleDTO> dtoList = posts.getContent();
        if (dtoList.isEmpty()) {
            return new PageResponseDTO<>(requestDTO, posts.getTotalElements(), List.of(), PAGE_BLOCK_SIZE);
        }

        List<Long> postIds = dtoList.stream().map(PostSimpleDTO::id).toList();
        Map<Long, Integer> attachCounts = postIds.isEmpty()
            ? Collections.emptyMap()
            : attachClient.countByPostIds(postIds);

        Map<String, AuthClient.PublicProfileResponse> profileCache = new HashMap<>();

        List<PostListItemResponse> responses = dtoList.stream()
            .map(post -> {
                AuthClient.PublicProfileResponse profile = profileCache.computeIfAbsent(
                    post.memberUuid(),
                    uuid -> {
                        try {
                            return authClient.getPublicMemberProfile(uuid);
                        } catch (Exception e) {
                            // 비로그인 상태나 Auth 호출 실패 시 fallback
                            return new AuthClient.PublicProfileResponse("익명", null);
                        }
                    }
                );

                return new PostListItemResponse(
                    post.id(),
                    post.title(),
                    post.createdAt(),
                    post.categoryName(),
                    profile.nickname(),
                    profile.profileImageUrl(),
                    post.commentCount(),
                    attachCounts.getOrDefault(post.id(), 0)
                );
            })
            .toList();

        return new PageResponseDTO<>(requestDTO, posts.getTotalElements(), responses, PAGE_BLOCK_SIZE);
    }
}
