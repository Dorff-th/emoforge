package dev.emoforge.auth.controller.admin;

import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.enums.MemberStatus;
import dev.emoforge.auth.service.admin.MemberAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 전용 회원관리 API
 * /api/admin/members/**
 */
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MemberAdminController {

    private final MemberAdminService memberAdminService;

    /**
     * ✅ 회원 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {
        return ResponseEntity.ok(memberAdminService.getAllMembers());
    }

    /**
     * ✅ 회원 상태 변경
     * @param uuid  회원 UUID
     * @param status  ACTIVE / INACTIVE
     */
    @PatchMapping("/{uuid}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String uuid,
            @RequestParam MemberStatus status
    ) {
        memberAdminService.updateStatus(uuid, status);
        return ResponseEntity.noContent().build();
    }

    /**
     * ✅ 회원 탈퇴 여부 변경
     * @param uuid  회원 UUID
     * @param deleted true or false
     */
    @PatchMapping("/{uuid}/deleted")
    public ResponseEntity<Void> updateDeleted(
            @PathVariable String uuid,
            @RequestParam boolean deleted
    ) {
        memberAdminService.updateDeleted(uuid, deleted);
        return ResponseEntity.noContent().build();
    }
}
