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
 * /api/auth/admin/members/**
 */
@RestController
@RequestMapping("/api/auth/admin/members")
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
            @PathVariable("uuid") String uuid,
            @RequestParam("status") String status
    ) {
        memberAdminService.updateStatus(uuid, MemberStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.noContent().build();
    }

    /**
     * ✅ 회원 탈퇴 여부 변경
     * @param uuid  회원 UUID
     * @param deleted true or false
     */
    @PatchMapping("/{uuid}/deleted")
    public ResponseEntity<Member> updateDeleted(
            @PathVariable("uuid") String uuid,
            @RequestParam("deleted") boolean deleted
    ) {
        Member updated = memberAdminService.updateDeleted(uuid, deleted);
        return ResponseEntity.ok(updated); // ✅ 변경된 회원 반환
    }



}
