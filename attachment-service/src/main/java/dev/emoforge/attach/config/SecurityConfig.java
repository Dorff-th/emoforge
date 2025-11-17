package dev.emoforge.attach.config;

import dev.emoforge.attach.security.JwtAuthenticationFilter;
import dev.emoforge.attach.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(AuthCorsProperties.class)
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthCorsProperties corsProps;

    // ✅ 완전한 해결책: 정적 파일 URL을 SecurityFilterChain에서 제외
    /*@Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                //.requestMatchers("/uploads/**");
                .requestMatchers("/error"); // 이건 유지 가능
    }*/

    @Bean
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
                        .requestMatchers("/api/attach/welcome",  "/api/attach/test/**").permitAll()
                        .requestMatchers("/api/attach/uploads/profile_image/**").permitAll()
                        .requestMatchers("/api/attach/uploads/images/**").permitAll() //ec2운영환경
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/attach/download/**").permitAll()
                        .requestMatchers("/api/attach/count/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/attach/post/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/attach/profile/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/attach/profile-images/**").permitAll()
                        .requestMatchers("/api/attach/public/profile").permitAll() // 사용자 프로필 이미지만을 조회할때 모두 접근 가능하게 설정
                        .requestMatchers(HttpMethod.POST,"/api/attach/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE,"/api/attach/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // ✅ 쿠키 포함
        /*config.setAllowedOrigins(Arrays.asList(
                "http://app1.127.0.0.1.nip.io:5173",
                "http://app2.127.0.0.1.nip.io:5174",
                "http://app3.127.0.0.1.nip.io:5175"
        ));*/
        config.setAllowedOrigins(corsProps.allowedOrigins()); // ← 깔끔!
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
