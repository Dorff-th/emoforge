package dev.emoforge.auth.config;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;


import dev.emoforge.auth.entity.Member;
import dev.emoforge.auth.enums.MemberStatus;
import dev.emoforge.auth.security.jwt.JwtAuthenticationFilter;
import dev.emoforge.auth.security.jwt.JwtTokenProvider;
import dev.emoforge.auth.security.oauth.CustomOAuth2User;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
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
@EnableConfigurationProperties(AuthCorsProperties.class)
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtTokenProvider jwtTokenProvider;

    // ✅ application.yml에서 주입받기
    @Value("${auth.redirect.success}")
    private String successRedirectUrl;

    @Value("${auth.redirect.inactive}")
    private String inactiveRedirectUrl;

    @Value("${auth.redirect.deleted}")
    private String deletedRedirectUrl;

    @Value("${auth.cookie.access-domain}")
    private String accessDomain;

    @Value("${auth.cookie.refresh-domain}")
    private String refreshDomain;

    @Value("${auth.cookie.same-site}")
    private String sameSite;

    //@Value("${auth.cors.allowed-origins}")
    //private List<String> allowedOrigins;

    private final AuthCorsProperties corsProps;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                        // ✅ 추가: 공개 프로필 조회, 비로그인 허용 엔드포인트
                        .requestMatchers("/api/auth/public/**").permitAll()
                        .requestMatchers("/api/auth/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(
                        token -> jwtTokenProvider.validateToken(token, false),
                        token -> jwtTokenProvider.getAuthentication(token)
                ), UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler((request, response, authentication) -> {
                            CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
                            Member member = principal.getMember();

                            // ✅ 비활성 / 삭제 계정 리다이렉트
                            if (member.getStatus() == MemberStatus.INACTIVE) {
                                response.sendRedirect(inactiveRedirectUrl);
                                return;
                            }
                            if (member.isDeleted()) {
                                response.sendRedirect(deletedRedirectUrl);
                                return;
                            }

                            String accessToken = jwtTokenProvider.generateAccessToken(
                                    principal.getUsername(),
                                    principal.getRole().name(),
                                    principal.getUuid()
                            );
                            String refreshToken = jwtTokenProvider.generateRefreshToken(
                                    principal.getUsername(),
                                    principal.getUuid()
                            );

                            ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                                    .httpOnly(true)
                                    .secure(false)
                                    .sameSite(sameSite)
                                    .domain(accessDomain)
                                    .path("/")
                                    .maxAge(Duration.ofHours(1))
                                    .build();

                            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                                    .httpOnly(true)
                                    .secure(false)
                                    .domain(refreshDomain)
                                    .path("/")
                                    .maxAge(Duration.ofDays(7))
                                    .build();

                            response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
                            response.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);

                            response.sendRedirect(successRedirectUrl);
                        })
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        //config.setAllowedOrigins(allowedOrigins);
        config.setAllowedOrigins(corsProps.allowedOrigins()); // ← 깔끔!
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

