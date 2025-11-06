package dev.emoforge.attach.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final List<String> WHITE_LIST = List.of(
            "/api/attach/profile/",
            "/api/attach/uploads/",
            "/uploads/"
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        log.debug("\n\n\n ==🔍 JwtFilter URI: {}", request.getRequestURI());
        log.debug("\n\n");

        String uri = request.getRequestURI();

        // 🔹 화이트리스트는 토큰 검사 생략
        if (WHITE_LIST.stream().anyMatch(uri::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = resolveTokenFromCookie(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String memberUuid = jwtTokenProvider.getMemberUuid(token);

            // 인증 객체 생성 (ROLE 은 일단 비워둠)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(memberUuid, null, null);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveTokenFromCookie(HttpServletRequest request) {

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {

            if ("access_token".equals(cookie.getName())) { // Auth-Service에서 내려주는 쿠키명 확인
                return cookie.getValue();
            }
        }
        return null;
    }
}
