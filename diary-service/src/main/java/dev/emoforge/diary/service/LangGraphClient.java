package dev.emoforge.diary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class LangGraphClient {

    private final RestTemplate restTemplate;

    @Value("${langgraph.base-url:http://lang.127.0.0.1.nip.io:8000/api}")
    private String baseUrl;

    /**
     * LangGraph-Service에 회고 요약 요청
     */
    public String requestSummary(LocalDate date, String fullContent) {
        String url = baseUrl + "/diary/gpt/summary";

        Map<String, Object> body = Map.of(
                "date", date.toString(),
                "content", fullContent
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Object summary = response.getBody().get("summary");
            return summary != null ? summary.toString() : "";
        }

        throw new RuntimeException("LangGraph 응답이 비정상입니다: " + response.getStatusCode());
    }
}

