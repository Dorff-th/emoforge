package dev.emoforge.auth.controller;

import dev.emoforge.auth.dto.LoginRequest;
import dev.emoforge.auth.dto.LoginResponse;
import dev.emoforge.auth.dto.MemberDTO;
import dev.emoforge.auth.dto.SignUpRequest;
import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.repository.MemberRepository;
import dev.emoforge.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final MemberRepository memberRepository;
    
    @PostMapping("/signup")
    public ResponseEntity<Member> signUp(@Valid @RequestBody SignUpRequest request) {
        Member member = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public MemberDTO getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }

        String username = authentication.getName(); // JWT sub (username/email) //지금은 kakao_oauth_id로 되어있음

        Long kakaoId = Long.parseLong(username);

        Member member = memberRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return new MemberDTO(member);
    }
}
