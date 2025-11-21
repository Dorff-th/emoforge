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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.web.SecurityFilterChain;


import dev.emoforge.auth.service.CustomOAuth2UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
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

    @Value("${auth.cookie.secure}")
    private boolean secure;

    private final Environment env;

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
                // 🔒 이 체인은 /api/auth/** 만 처리 (명확하게 스코프 한정)
                .securityMatcher("/api/auth/**") // ← 추가

                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // ✅ 콜백/인가 엔드포인트는 반드시 허용
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/login/**",                 // ← 카카오 콜백 포함
                                "/api/auth/oauth2/**"                 // ← 인가 시작점 포함
                        ).permitAll()
                        .requestMatchers(
                                "/api/auth/refresh",
                                "/api/auth/health",
                                "/api/auth/public/**"
                        ).permitAll()
                        .requestMatchers("/api/auth/**").authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(
                        token -> jwtTokenProvider.validateToken(token, false),
                        token -> jwtTokenProvider.getAuthentication(token)
                ), UsernamePasswordAuthenticationFilter.class)
                // API는 302 말고 401 고정
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")
                        )
                )
                .oauth2Login(oauth2 -> oauth2
                        // ✅ 여기서 Spring의 기본 경로를 /api/auth/** 로 "강제"한다 (가장 중요)
                        .authorizationEndpoint(authorization ->
                                authorization.baseUri("/api/auth/oauth2/authorization") // ← 변경
                        )
                        .redirectionEndpoint(redirection ->
                                redirection.baseUri("/api/auth/login/oauth2/code/*")    // ← 변경
                        )
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler((request, response, authentication) -> {
                            CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
                            Member member = principal.getMember();

                            if (member.getStatus() == MemberStatus.INACTIVE) {
                                response.sendRedirect(inactiveRedirectUrl);
                                return;
                            }
                            /*if (member.isDeleted()) { <-- 탈퇴 신청한 사용자가 스스로 탈퇴신청을 취소하게 하려면 주석처리해야 함 
                                response.sendRedirect(deletedRedirectUrl);
                                return;
                            }*/

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
                                    .secure(secure)
                                    .sameSite(sameSite)
                                    .domain(accessDomain)  // 예: .emoforge.dev
                                    .path("/")
                                    .maxAge(Duration.ofHours(1))
                                    .build();

                            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                                    .httpOnly(true)
                                    .secure(secure)
                                    .domain(refreshDomain) // 예: .emoforge.dev
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
        //config.setAllowedOrigins(corsProps.allowedOrigins()); // ← 깔끔!
        if (Arrays.asList(env.getActiveProfiles()).contains("prod")) {
            System.out.println("\n\n\n===" + corsProps.allowedOriginPatterns());
            config.setAllowedOriginPatterns(corsProps.allowedOriginPatterns());
        } else {
            System.out.println("\n\n\n===" + corsProps.allowedOriginPatterns());
            config.setAllowedOrigins(corsProps.allowedOrigins());
        }
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

