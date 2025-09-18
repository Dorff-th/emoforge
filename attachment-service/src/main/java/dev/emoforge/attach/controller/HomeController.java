package dev.emoforge.attach.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/api/attach/welcome")
    public String welcome() {
        return "Attachment-Service is running!";
    }
}
