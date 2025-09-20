package dev.emoforge.auth.config;

import java.time.Duration;
import java.util.Arrays;


import dev.emoforge.auth.security.jwt.JwtTokenProvider;
import dev.emoforge.auth.security.oauth.CustomOAuth2User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.web.SecurityFilterChain;


import dev.emoforge.auth.service.CustomOAuth2UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ 여기!
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                        .requestMatchers("/api/auth/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(customOAuth2UserService)
                        )
                        .successHandler((request, response, authentication) -> {
                            CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();

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

                            response.sendRedirect("http://app1.127.0.0.1.nip.io:5173/profile");
                        })

                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // ✅ 쿠키 포함
        config.setAllowedOrigins(Arrays.asList(
                "http://app1.127.0.0.1.nip.io:5173"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

