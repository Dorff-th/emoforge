// dev.emoforge.auth.controller.PublicProfileController.java
package dev.emoforge.auth.controller;

import dev.emoforge.auth.dto.PublicProfileResponse;
import dev.emoforge.auth.service.MemberPublicProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/public/members")
@RequiredArgsConstructor
public class PublicProfileController {

    private final MemberPublicProfileService publicProfileService;

    @GetMapping("/{uuid}/profile")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable("uuid") String uuid) {
        return ResponseEntity.ok(publicProfileService.getPublicProfile(uuid));
    }
}
