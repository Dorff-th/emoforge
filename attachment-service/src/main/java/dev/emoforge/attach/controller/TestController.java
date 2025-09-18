package dev.emoforge.attach.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/attach/test/jwt")
    public String testJwt(Authentication authentication) {
        return "JWT member_uuid = " + authentication.getPrincipal();
    }
}
