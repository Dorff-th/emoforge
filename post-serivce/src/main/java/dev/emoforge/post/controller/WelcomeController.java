package dev.emoforge.post.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {

    @GetMapping("/api/posts/welcome")
    public String welcome() {
        return "Post-Service is running!";
    }
}
