package dev.emoforge.auth.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static String getCurrentUserUuidOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Unauthenticated");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserPrincipal user) {
            return user.getUuid();
        }

        throw new IllegalStateException("Unexpected principal type: " + principal);
    }
}


