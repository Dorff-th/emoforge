package dev.emoforge.cleanup.repository;

import dev.emoforge.cleanup.entitiy.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    @Query("""
        SELECT a
        FROM Attachment a
        WHERE a.uploadType = 'PROFILE_IMAGE'
        AND a.id NOT IN (
            SELECT MAX(id)
            FROM Attachment
            WHERE uploadType = 'PROFILE_IMAGE'
            GROUP BY memberUuid
        )
    """)
    List<Attachment> findGarbageProfileImages();

    @Modifying
    @Transactional
    @Query(value = """
        DELETE a
            FROM attachment a
                LEFT JOIN (
                    SELECT max_id
                    FROM (
                        SELECT MAX(id) AS max_id
                        FROM attachment
                        WHERE upload_type = 'PROFILE_IMAGE'
                        GROUP BY member_uuid
                    ) t
            ) latest
        ON a.id = latest.max_id
        WHERE a.upload_type = 'PROFILE_IMAGE'
        AND latest.max_id IS NULL
    """, nativeQuery = true)
    int deleteGarbageProfileImages();

    @Query("""
        SELECT a
        FROM Attachment a
        WHERE a.uploadType = 'EDITOR_IMAGE'
        AND a.status = 'TEMP'
        AND a.postId IS NULL
        """)
    List<Attachment> findUnusedEditorImages();

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM attachment
        WHERE upload_type = 'EDITOR_IMAGE'
        AND status = 'TEMP'
        AND post_id IS NULL
        """, nativeQuery = true)
    int deleteUnusedEditorImages();
}