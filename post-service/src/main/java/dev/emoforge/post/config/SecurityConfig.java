package dev.emoforge.post.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import dev.emoforge.post.config.JwtTokenProvider;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(AuthCorsProperties.class)
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthCorsProperties corsProps;

    @Bean
    @Order(1) // 우선순위 높게
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/posts/admin/**") // 관리자 API만 적용
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                //.requestMatchers("/api/posts/admin/test/jwt").permitAll()
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ 여기!
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                        "/swagger-ui/**",
                            "/v3/api-docs/**",
                            "/swagger-resources/**",
                            "/api-docs/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/me/statistics").authenticated()
                        .requestMatchers(HttpMethod.GET,"/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/posts/**").authenticated()
                        .requestMatchers(HttpMethod.PUT,"/api/posts/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE,"/api/posts/**").authenticated()
                        .anyRequest().authenticated()
                )

                .addFilterBefore(new JwtAuthenticationFilter(
                    token -> jwtTokenProvider.validateToken(token, false),
                    token -> jwtTokenProvider.getAuthentication(token)
                ), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("Unauthorized");
                        })
                );;

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // ✅ 쿠키 포함
        config.setAllowedOrigins(corsProps.allowedOrigins()); // ← 깔끔!
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
