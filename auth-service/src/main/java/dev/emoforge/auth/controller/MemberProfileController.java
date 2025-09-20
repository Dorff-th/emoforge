package dev.emoforge.auth.controller;

import dev.emoforge.auth.dto.AvailabilityResponse;
import dev.emoforge.auth.dto.MemberProfileResponse;
import dev.emoforge.auth.dto.UpdateEmailRequest;
import dev.emoforge.auth.dto.UpdateNicknameRequest;
import dev.emoforge.auth.security.CustomUserPrincipal;
import dev.emoforge.auth.service.MemberProfileService;
import dev.emoforge.auth.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

// controller/MemberProfileController.java
@RestController
@RequestMapping("/api/auth/members")
@RequiredArgsConstructor
@Slf4j
public class MemberProfileController {

    private final MemberProfileService memberProfileService;

    @GetMapping("/check-nickname")
    public AvailabilityResponse checkNickname(@RequestParam("nickname") String nickname) {
        return memberProfileService.checkNickname(nickname);
    }

    @GetMapping("/check-email")
    public AvailabilityResponse checkEmail(@RequestParam("email") String email) {
        return memberProfileService.checkEmail(email);
    }

    @PutMapping("/nickname")
    public MemberProfileResponse updateNickname(@RequestBody UpdateNicknameRequest req, @AuthenticationPrincipal CustomUserPrincipal user) {
        String uuid = user.getUuid();
        return memberProfileService.updateNickname(uuid, req.nickname());
    }

    @PutMapping("/email")
    public MemberProfileResponse updateEmail(@RequestBody UpdateEmailRequest req, @AuthenticationPrincipal CustomUserPrincipal user) {
        String uuid = user.getUuid();
        return memberProfileService.updateEmail(uuid, req.email());
    }
}
