package dev.emoforge.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

@SpringBootApplication
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}
	// ✅ 애플리케이션 시작 시 카카오 scope 확인용 로그
    @Bean
    CommandLineRunner runner(ClientRegistrationRepository repo) {
        return args -> {
            ClientRegistration kakao = repo.findByRegistrationId("kakao");
            System.out.println(">>> Kakao scopes: " + kakao.getScopes());
        };
    }

}
