package dev.emoforge.post.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j
public class JwtTokenProvider {

    // ✅ (변경) 사용자 / 관리자 secret 분리
    @Value("${jwt.secret.user}")
    private String userSecret;

    @Value("${jwt.secret.admin}")
    private String adminSecret;

    private SecretKey getSigningKey(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getUserKey() {
        return getSigningKey(userSecret);
    }

    private SecretKey getAdminKey() {
        return getSigningKey(adminSecret);
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token, boolean isAdmin) {

        try {
            String which = isAdmin ? "ADMIN" : "USER";
            log.info("🔑 validateToken(): using {} secret", which);
            // ✅ (변경) isAdmin 여부에 따라 다른 secret으로 검증
            Jwts.parserBuilder()
                .setSigningKey(isAdmin ? getAdminKey() : getUserKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT token");
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT token", ex);
        }
        return false;
    }

    /*public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }*/
    public Claims getClaims(String token) {
        // 우선 Base64로 payload만 잠깐 파싱 (검증은 하지 않음)
        String[] parts = token.split("\\.");
        String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
        boolean isAdmin = payloadJson.contains("\"role\":\"ADMIN\"");

        return Jwts.parserBuilder()
            .setSigningKey(isAdmin ? getAdminKey() : getUserKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public String getUsernameFromToken(String token) {
        // 🔄 [2026-01-24 21:47 KST] subject는 uuid이므로 username은 claim에서 조회
        return getClaims(token).get("username", String.class);
    }
    /**
     * uuid 추출
     */
    public String getUuidFromToken(String token) {
        // 🔄 [2026-01-24] uuid는 JWT subject에서 직접 추출
        return getClaims(token).getSubject();
    }
    /**
     * role 추출
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }


    public Authentication getAuthentication(String token) {

        String username = getUsernameFromToken(token);
        String role = getRoleFromToken(token);
        String uuid = getUuidFromToken(token); // ⚡ JWT claim에서 uuid 꺼내오기
        // 🔄 [2026-01-24 21:47 KST] Authentication 식별자는 uuid 기준

        if (username == null || username.isBlank()) {
            //  [2026-01-24] refresh 토큰 등 username 없는 경우 fallback
            username = uuid;
        }

        List<GrantedAuthority> authorities =
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));

        CustomUserPrincipal principal = new CustomUserPrincipal(username, uuid, authorities);

        Authentication authentication =
            new UsernamePasswordAuthenticationToken(principal, token, authorities);

        return authentication;
    }

}
