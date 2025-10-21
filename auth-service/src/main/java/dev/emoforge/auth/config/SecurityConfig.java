package dev.emoforge.auth.config;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;


import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.enums.MemberStatus;
import dev.emoforge.auth.security.jwt.JwtAuthenticationFilter;
import dev.emoforge.auth.security.jwt.JwtTokenProvider;
import dev.emoforge.auth.security.oauth.CustomOAuth2User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.web.SecurityFilterChain;


import dev.emoforge.auth.service.CustomOAuth2UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtTokenProvider jwtTokenProvider;

    // ✅ (변경) admin / user 전용 체인 분리
    @Bean
    @Order(1) // 우선순위 높게
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/auth/admin/**") // 관리자 API만 적용
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/admin/login", "/api/auth/admin/logout").permitAll()
                        .anyRequest().hasRole("ADMIN")
                )
                // ✅ 관리자 전용 토큰 필터
                .addFilterBefore(new JwtAuthenticationFilter(
                        token -> jwtTokenProvider.validateToken(token, true),
                        token -> jwtTokenProvider.getAuthentication(token)
                ), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    @Order(2)
    public SecurityFilterChain userFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ 여기!
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                        .requestMatchers("/api/auth/members/{uuid}/profile").authenticated()    // 민감한 개인정보가 들어간 사용자 프로필은 인증된 사용자만 조회
                        .requestMatchers("/api/auth/public/members/{uuid}/profile").permitAll()   //  닉네임과  profile image url만 담긴 프로필 정보 조회는 모두 공개
                        // ✅ 관리자 로그인 페이지 및 인증 API는 공개 허용
                        .requestMatchers("/api/auth/admin/login").permitAll()
                        // ✅ 관리자 전용 API는 ADMIN 권한만 접근 가능
                        .requestMatchers("/api/auth/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/auth/**").authenticated()
                        .anyRequest().authenticated()
                )
                // ✅ 필터 등록
                // ✅ 사용자 전용 토큰 필터
                .addFilterBefore(new JwtAuthenticationFilter(
                        token -> jwtTokenProvider.validateToken(token, false),
                        token -> jwtTokenProvider.getAuthentication(token)
                ), UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(customOAuth2UserService)
                        )
                        .successHandler((request, response, authentication) -> {
                            CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();

                            Member member = principal.getMember();
                            // ✅ 로그인 차단 조건
                            if (member.getStatus() == MemberStatus.INACTIVE) {
                                response.sendRedirect("http://app1.127.0.0.1.nip.io:5173/login?error=inactive");
                                return;
                            }

                            if (member.isDeleted()) {
                                response.sendRedirect("http://app1.127.0.0.1.nip.io:5173/login?error=deleted");
                                return;
                            }

                            // AccessToken 발급
                            String accessToken = jwtTokenProvider.generateAccessToken(
                                    principal.getUsername(),
                                    principal.getRole().name(),
                                    principal.getUuid()
                            );

                            // RefreshToken 발급
                            String refreshToken = jwtTokenProvider.generateRefreshToken(
                                    principal.getUsername(),
                                    principal.getUuid()
                            );

                            // AccessToken → 쿠키 저장
                            ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                                    .httpOnly(true)
                                    .secure(false) // 운영에서는 true
                                    //.sameSite("None")
                                    .domain("127.0.0.1.nip.io")
                                    .path("/")
                                    .maxAge(Duration.ofHours(1))
                                    .build();

                            // RefreshToken → 쿠키 저장 (예: 장기 보관)
                            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                                    .httpOnly(true)
                                    .secure(false)
                                    //.sameSite("None")
                                    .domain("127.0.0.1.nip.io")
                                    .path("/")
                                    .maxAge(Duration.ofDays(7))
                                    .build();

                            response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                            // SPA에서 필요하다면 헤더에도 내려줄 수 있음
                            response.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);

                            try {
                                response.sendRedirect("http://app1.127.0.0.1.nip.io:5173/profile");
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            } finally {
                            }
                        })

                ).exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // ✅ 쿠키 포함
        config.setAllowedOrigins(Arrays.asList(
                "http://app1.127.0.0.1.nip.io:5173",
                "http://app2.127.0.0.1.nip.io:5174",
                "http://app3.127.0.0.1.nip.io:5175",
                "http://app4.127.0.0.1.nip.io:5176"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

