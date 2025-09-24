package dev.emoforge.post.service.bff;

import dev.emoforge.post.domain.Comment;
import dev.emoforge.post.dto.bff.CommentDetailResponse;
import dev.emoforge.post.dto.external.AttachmentResponse;
import dev.emoforge.post.repository.CommentRepository;
import dev.emoforge.post.service.external.AttachClient;
import dev.emoforge.post.service.external.AuthClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentsFacadeService {

    private final CommentRepository commentRepository;
    private final AuthClient authClient;
    private final AttachClient attachClient;

    @Transactional(readOnly = true)
    public List<CommentDetailResponse> getCommentsByPost(Long postId) {
        List<Comment> comments = commentRepository.findAllByPostId(postId);

        Map<String, String> nicknameCache = new HashMap<>();
        Map<String, String> profileImageCache = new HashMap<>();

        return comments.stream()
            .map(comment -> {
                String memberUuid = comment.getMemberUuid();

                // 닉네임 캐싱
                String nickname = nicknameCache.computeIfAbsent(
                    memberUuid,
                    uuid -> authClient.getMemberProfile(uuid).nickname()
                );

                // 프로필 이미지 캐싱
                String profileImageUrl = profileImageCache.computeIfAbsent(
                    memberUuid,
                    uuid -> {
                        ResponseEntity<AttachmentResponse> response = attachClient.findLatestProfileImage(uuid);
                        AttachmentResponse image = response.getBody();
                        return image != null ? image.publicUrl() : null;
                    }
                );

                return new CommentDetailResponse(
                    comment.getId(),
                    comment.getPostId(),
                    comment.getMemberUuid(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    nickname,
                    profileImageUrl
                );
            })
            .toList();
    }

}
