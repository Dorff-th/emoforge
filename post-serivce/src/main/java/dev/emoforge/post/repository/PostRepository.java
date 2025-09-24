package dev.emoforge.post.repository;

import dev.emoforge.post.domain.Post;
import dev.emoforge.post.dto.internal.PostDetailDTO;
import dev.emoforge.post.dto.internal.PostSimpleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByCategoryId(Long categoryId, Pageable pageable);

    Page<Post> findAllByMemberUuid(String memberUuid, Pageable pageable);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.categoryId = :defaultCategoryId WHERE p.categoryId = :categoryId")
    int movePostsToDefaultCategory(@Param("categoryId") Long categoryId, @Param("defaultCategoryId") Long defaultCategoryId);

    void deleteByIdIn(List<Long> postIds);

    @Query("SELECT new dev.emoforge.post.dto.internal.PostSimpleDTO(" +
        "p.id, p.title, p.createdAt, c.name, p.memberUuid, " +
        "(SELECT COUNT(cm) FROM Comment cm WHERE cm.postId = p.id)" +
        ") " +
        "FROM Post p " +
        "LEFT JOIN Category c ON p.categoryId = c.id " +
        "ORDER BY p.id DESC")
    Page<PostSimpleDTO> findAllPosts(Pageable pageable);

    /*// 특정 태그 조회
    @Query("SELECT new dev.noteforge.knowhub.post.dto.PostDTO(" +
        "p.id, p.title, p.createdAt, c.name, m.username, m.id, " +
        "COUNT(cm.id), m.nickname, " +
        "COUNT(CASE WHEN a.uploadType = 'ATTACHMENT' THEN a.id END)) " +
        "FROM Post p " +
        "LEFT JOIN p.category c " +
        "LEFT JOIN p.member m " +
        "LEFT JOIN p.comments cm " +
        "LEFT JOIN p.attachments a " +
        "JOIN p.postTags pt " +
        "JOIN pt.tag t " +
        "WHERE t.name = :tagName " +
        "GROUP BY p.id, p.title, p.createdAt, c.name, m.username, m.id, m.nickname " +
        "ORDER BY p.id DESC")
    Page<PostDTO> findAllPostsByTag(@Param("tagName") String tagName, Pageable pageable);*/

    /**
     *  게시물 상세 조회
     * @param postId
     * @return Optional<PostDetailDTO>
     */
    @Query("""
        SELECT new dev.emoforge.post.dto.internal.PostDetailDTO(
            p.id,
            p.memberUuid,
            p.title,
            p.content,
            p.createdAt,
            p.updatedAt,
            p.categoryId,
            (SELECT c.name FROM Category c WHERE c.id = p.categoryId)
        )
        FROM Post p
        WHERE p.id = :postId
    """)
    Optional<PostDetailDTO> findPostDetail(@Param("postId") Long postId);
}
