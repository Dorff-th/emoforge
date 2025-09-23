package dev.emoforge.post.repository;

import dev.emoforge.post.domain.Post;
import dev.emoforge.post.dto.internal.PostSimpleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
