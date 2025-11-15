package dev.emoforge.cleanup.runner;

import dev.emoforge.cleanup.service.EditorImageCleanupService;
import dev.emoforge.cleanup.service.ProfileImageCleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CleanupRunner implements ApplicationRunner {

    private final ProfileImageCleanupService profileImageCleanupService;
    private final EditorImageCleanupService editorImageCleanupService;

    @Override
    public void run(ApplicationArguments args) throws Exception {

        if (args.containsOption("profile")) {
            profileImageCleanupService.clean();
        }

        if (args.containsOption("editor")) {
            editorImageCleanupService.clean();
        }

        System.exit(0);
    }
}
