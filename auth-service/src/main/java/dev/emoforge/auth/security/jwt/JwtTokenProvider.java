package dev.emoforge.auth.security.jwt;

import dev.emoforge.auth.security.CustomUserPrincipal;
import io.jsonwebtoken.*;
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
import java.util.Collections;
import java.util.Date;
import java.util.List;


@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${jwt.admin-token-expiration}")
    private long adminTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Access Token 생성
     */
    public String generateAccessToken(String username, String role, String uuid) {
        return Jwts.builder()
                .setSubject(username) // username = email
                .claim("uuid", uuid)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(String username, String uuid) {
        return Jwts.builder()
                .setSubject(username)
                .claim("uuid", uuid)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
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
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
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

    /**
     * Authentication 생성 (Spring Security 연동)
     */
    /*public Authentication getAuthentication(String token) {
        String username = getUsernameFromToken(token);
        String role = getRoleFromToken(token);

        return new UsernamePasswordAuthenticationToken(
                username,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }*/
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
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

}
