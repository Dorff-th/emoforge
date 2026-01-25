package dev.emoforge.diary.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collections;
import java.util.List;

@Component
public class JwtTokenProvider {

    private final Key key;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public String getMemberUuid(String token) {
        return getClaims(token).get("uuid", String.class);
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
}