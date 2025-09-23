package dev.emoforge.post.service.external;

import dev.emoforge.post.dto.external.MemberProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "auth-service",
    url = "${service.auth.url}" // application.yml에서 관리
)
public interface AuthClient {

    @GetMapping("/api/auth/members/{uuid}/profile")
    MemberProfileResponse getMemberProfile(@PathVariable("uuid") String uuid);
}
