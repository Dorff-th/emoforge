package dev.emoforge.cleanup.runner;

import dev.emoforge.cleanup.service.EditorImageCleanupService;
import dev.emoforge.cleanup.service.ProfileImageCleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class CleanupRunner implements ApplicationRunner {

    private final ProfileImageCleanupService profileImageCleanupService;
    private final EditorImageCleanupService editorImageCleanupService;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private Environment env;   // ⭐ 요게 있어야 env.getActiveProfiles() 가능

    @Override
    public void run(ApplicationArguments args) throws Exception {

        System.out.println(">>> ACTIVE PROFILE = " + Arrays.toString(env.getActiveProfiles()));
        System.out.println(">>> DATASOURCE URL = " + dataSource.getConnection().getMetaData().getURL());

        if (args.containsOption("profile")) {
            profileImageCleanupService.clean();
        }

        if (args.containsOption("editor")) {
            editorImageCleanupService.clean();
        }

        System.exit(0);
    }
}
