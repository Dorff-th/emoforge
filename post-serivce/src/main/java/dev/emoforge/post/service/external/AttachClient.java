package dev.emoforge.post.service.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "attach-service", url = "${service.attach.url}")
public interface AttachClient {

    @PostMapping("/api/attach/count/batch")
    Map<Long, Integer> countByPostIds(@RequestBody List<Long> postIds);
}
