package dev.emoforge.post.service.internal;


import com.nimbusds.openid.connect.sdk.assurance.evidences.attachment.Attachment;
import dev.emoforge.post.domain.Category;
import dev.emoforge.post.domain.Post;
import dev.emoforge.post.domain.PostTag;
import dev.emoforge.post.domain.Tag;
import dev.emoforge.post.dto.bff.PageResponseDTO;
import dev.emoforge.post.dto.internal.PageRequestDTO;
import dev.emoforge.post.dto.internal.PostDetailDTO;
import dev.emoforge.post.dto.internal.PostRequestDTO;
import dev.emoforge.post.dto.internal.PostUpdateDTO;
import dev.emoforge.post.repository.CategoryRepository;
import dev.emoforge.post.repository.PostRepository;
import dev.emoforge.post.repository.PostTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;

    private final CategoryRepository categoryRepository;


    private final TagService tagService;
    private final PostTagRepository postTagRepository;



    @Transactional
    public Post createPost(PostRequestDTO dto, String memberUuid) {

        Category category = categoryRepository.findById(dto.categoryId()).orElseThrow(()->new IllegalArgumentException("카테고리가 없습니다."));

        Post post = Post.create(dto.title(), dto.content(), category.getId(), memberUuid);

        Post savedPost = postRepository.save(post);


        //태그 & post_tag 관계 저장
        if (dto.tags() != null) {
            String[] tagArray = dto.tags().split(",");
            for (String tagName : tagArray) {
                                Tag tag = tagService.getOrCreateTag(tagName);
                PostTag postTag = new PostTag(savedPost, tag);
                postTagRepository.save(postTag);
            }
        }

        return savedPost;
    }

    //Post 수정요청할때 필요한 해당 post 작성자(Member) id값을 조회하기 위해 필요
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }


    /*@Transactional
    public int editPost(PostUpdateDTO dto) {

        Post post = postRepository.findById(dto.getId()).orElseThrow(()->new IllegalArgumentException("해당 post가 없음!"));
        if(dto.getAttachments() != null && !dto.getAttachments().isEmpty()  ) {
            List<FileSaveResultDTO> fileSaveResultDTO= generalFileUtil.saveFiles(dto.getAttachments(), dto.getId());
            //fileSaveResultDTO.forEach(fileSaveDTO->log.debug("fileSaveDTO :" , fileSaveDTO.toString()));

            //Post post = postRepository.findById(dto.getId()).orElseThrow(()->new IllegalArgumentException("해당 post가 없음!"));

            List<Attachment> attachments = fileSaveResultDTO.stream()
                    .map(saveDto -> Attachment.builder()
                            .post(post)
                            .fileName(saveDto.getFileName())
                            .originFileName(saveDto.getOriginFileName())
                            .fileType(saveDto.getFileType())
                            .fileSize(saveDto.getSize())
                            .fileUrl(saveDto.getFileUrl())
                            .uploadType(saveDto.getUploadType())
                            .uploadedAt(LocalDateTime.now())
                            .build())
                    .toList();

            attachmentRepository.saveAll(attachments);
        }

        //첨부된 파일중 삭제 대상 첨부 파일 삭제
        if( dto.getDeleteIds() != null && !dto.getDeleteIds().isEmpty()) {
            attachmentRepository.deleteAllByIdInBatch(dto.getDeleteIds());
        }

        //삭제 대상 tag id들을 List<Long> 타입으로 변환후 삭제 쿼리 실행
        List<Long> deleteTagIds = StringUtils.toLongList(dto.getDeleteTagIds());
        if(deleteTagIds != null && !deleteTagIds.isEmpty()) {
            postTagRepository.deleteByPostIdAndTagIdIn(post.getId(), deleteTagIds);
        }

        //태그 & post_tag 관계 저장
        if (dto.getTags() != null) {
            String[] tagArray = dto.getTags().split(",");
            for (String tagName : tagArray) {
                Tag tag = tagService.getOrCreateTag(tagName);
                PostTag postTag = new PostTag(post, tag);
                postTagRepository.save(postTag);
            }
        }



      return  postRepository.updatePostById(dto);
    }*/


    //Post 삭제
    @Transactional
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }


}
