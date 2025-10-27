package dev.emoforge.post.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/posts/test/jwt")
    public String testJwt(Authentication authentication) {
        return "Post-Service : JWT member_uuid = " + authentication.getPrincipal();
    }
}
