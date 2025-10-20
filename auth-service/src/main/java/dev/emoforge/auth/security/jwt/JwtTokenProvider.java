package dev.emoforge.auth.security.jwt;

import dev.emoforge.auth.security.CustomUserPrincipal;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;


@Slf4j
@Component
public class JwtTokenProvider {

    // ✅ (변경) 사용자 / 관리자 secret 분리
    @Value("${jwt.secret.user}")
    private String userSecret;

    @Value("${jwt.secret.admin}")
    private String adminSecret;

  /*  @PostConstruct
    public void debugSecrets() {
        log.info("🔐 userSecret: {}", userSecret);
        log.info("🔐 adminSecret: {}", adminSecret);
    }
    @PostConstruct
    public void userSecret() {
        log.info("🔍 userSecret bytes: {}", userSecret.getBytes(StandardCharsets.UTF_8).length);
        log.info("🔍 adminSecret bytes: {}", adminSecret.getBytes(StandardCharsets.UTF_8).length);
    }
    @PostConstruct
    public void debugSecretExact() {
        log.info("🧩 adminSecret visible='{}'", adminSecret);
        log.info("🧩 adminSecret length={}", adminSecret.length());
        log.info("🧩 adminSecret bytes={}", adminSecret.getBytes(StandardCharsets.UTF_8).length);
    }*/


    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${jwt.admin-token-expiration}")
    private long adminTokenExpiration;

    // ✅ (변경) getSigningKey() → user/admin 모두 대응 가능하도록 오버로드
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
     * Access Token 생성 (User)
     */
    public String generateAccessToken(String username, String role, String uuid) {
        return Jwts.builder()
                .setSubject(username) // username = email
                .claim("uuid", uuid)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                // ✅ (변경) userSecret으로 서명
                .signWith(getUserKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Refresh Token 생성 (User)
     */
    public String generateRefreshToken(String username, String uuid) {
        return Jwts.builder()
                .setSubject(username)
                .claim("uuid", uuid)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                // ✅ (변경) userSecret으로 서명
                .signWith(getUserKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 관리자 전용 JWT 발급
     */
    public String generateAdminToken(String uuid, String username) {

        return Jwts.builder()
                .setSubject(username)
                .claim("uuid", uuid)
                //.claim("username", username)
                .claim("role", "ADMIN")
                .claim("type", "ADMIN_LOGIN") // 선택: 토큰 구분용
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + adminTokenExpiration))
                // ✅ (변경) adminSecret으로 서명
                .signWith(getAdminKey(), SignatureAlgorithm.HS256)
                .compact();
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

    /**
     * Claims 추출
     */
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


    /**
     * username 추출
     */
    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * uuid 추출
     */
    public String getUuidFromToken(String token) {
        return getClaims(token).get("uuid", String.class);
    }

    /**
     * role 추출
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * 만료 여부
     */
    public boolean isTokenExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public Authentication getAuthentication(String token) {

        String username = getUsernameFromToken(token);
        String role = getRoleFromToken(token);
        String uuid = getUuidFromToken(token); // ⚡ JWT claim에서 uuid 꺼내오기

        List<GrantedAuthority> authorities =
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));

        CustomUserPrincipal principal = new CustomUserPrincipal(username, uuid, authorities);

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(principal, token, authorities);

        return authentication;
    }



}
