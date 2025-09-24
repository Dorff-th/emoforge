package dev.emoforge.post.service.bff;

import dev.emoforge.post.dto.bff.PostDetailResponse;
import dev.emoforge.post.dto.external.AttachmentResponse;
import dev.emoforge.post.dto.external.MemberProfileResponse;
import dev.emoforge.post.dto.internal.PostDetailDTO;
import dev.emoforge.post.repository.CommentRepository;
import dev.emoforge.post.repository.PostRepository;
import dev.emoforge.post.service.external.AttachClient;
import dev.emoforge.post.service.external.AuthClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.javassist.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostDetailFacadeService {

    private final PostRepository postRepository;
    private final AuthClient authClient;
    private final AttachClient attachClient;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetail(Long postId) throws NotFoundException {
        // 1. 게시글 조회
        PostDetailDTO postDetailDTO = postRepository.findPostDetail(postId)
            .orElseThrow(() -> new NotFoundException("게시글 없음"));

        // 2. 작성자 정보
        MemberProfileResponse profile = authClient.getMemberProfile(postDetailDTO.getMemberUuid());

        // 3. 첨부파일 조회 (Attachment-Service)
        List<AttachmentResponse> editorImages =
            attachClient.findByPostId(postId, "EDITOR_IMAGE");

        List<AttachmentResponse> attachments =
            attachClient.findByPostId(postId, "ATTACHMENT");



        // 4. 조립 후 반환
        return new PostDetailResponse(
            postDetailDTO.getId(),
            postDetailDTO.getTitle(),
            postDetailDTO.getContent(),
            profile.memberUuid(),
            postDetailDTO.getCreatedAt(),
            postDetailDTO.getUpdatedAt(),
            postDetailDTO.getCategoryId(),
            postDetailDTO.getCategoryName(),
            profile.nickname(),
            editorImages,
            attachments
        );
    }
}

