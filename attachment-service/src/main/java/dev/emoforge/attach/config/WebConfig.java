package dev.emoforge.attach.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.path.profile-image.base-dir}")
    private String profileImageBaseDir;

    @Value("${file.upload.path.profile-image.public-url}")
    private String profileImagePublicUrl;

    @Value("${file.upload.path.editor-images.base-dir}")
    private String imageBaseDir;

    @Value("${file.upload.path.editor-images.public-url}")
    private String imagePublicUrl;


    //application.yml에 지정한 경로가 실제 URL로 노출되도록 아래 설정을 추가해야 해.
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(imagePublicUrl + "**")  // 브라우저 요청 경로
                .addResourceLocations("file:///" + imageBaseDir);  // 실제 물리 경로 (주의: 맨 끝에 / 꼭!)

        // 프로필 이미지
        registry.addResourceHandler(profileImagePublicUrl + "**")
                .addResourceLocations("file:///" + profileImageBaseDir);
    }
}

