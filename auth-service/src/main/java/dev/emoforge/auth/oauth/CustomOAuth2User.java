package dev.emoforge.auth.oauth;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import dev.emoforge.auth.enums.Role;

import lombok.Getter;

@Getter
public class CustomOAuth2User extends DefaultOAuth2User {

    private final String username; // email (or dummy)
    private final String uuid;     // Member.uuid (String 타입)
    private final Role role;       // USER / ADMIN

    public CustomOAuth2User(Collection<? extends GrantedAuthority> authorities,
                            Map<String, Object> attributes,
                            String nameAttributeKey,
                            String username,
                            String uuid,
                            Role role) {
        super(authorities, attributes, nameAttributeKey);
        this.username = username;
        this.uuid = uuid;
        this.role = role;
    }
}

