package com.devpulse.ml;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@Slf4j
public class InsightsController {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    @GetMapping("/focus-score")
    public ResponseEntity<?> focusScore(Authentication auth) {
        try {
            WebClient client = WebClient.create(mlServiceUrl);
            Map result = client.post()
                    .uri("/predict/focus-score")
                    .bodyValue(Map.of(
                            "hour_of_day", java.time.LocalTime.now().getHour(),
                            "day_of_week", java.time.LocalDate.now().getDayOfWeek().getValue(),
                            "planned_duration_mins", 60
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.warn("ML service unavailable, returning fallback: {}", e.getMessage());
            return ResponseEntity.ok(fallbackFocusScore());
        }
    }

    @GetMapping("/burnout-risk")
    public ResponseEntity<?> burnoutRisk(Authentication auth) {
        try {
            WebClient client = WebClient.create(mlServiceUrl);
            Map result = client.post()
                    .uri("/predict/burnout-risk")
                    .bodyValue(Map.of("user_id", auth.getName()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.warn("ML service unavailable for burnout: {}", e.getMessage());
            return ResponseEntity.ok(fallbackBurnoutRisk());
        }
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<?> peakHours(Authentication auth) {
        return ResponseEntity.ok(Map.of("message", "Connect ML service for peak hours data"));
    }

    @GetMapping("/task-eta/{taskId}")
    public ResponseEntity<?> taskEta(@PathVariable Long taskId, Authentication auth) {
        return ResponseEntity.ok(Map.of("taskId", taskId, "predictedHours", 5.0, "confidence", 0.72));
    }

    private Map<String, Object> fallbackFocusScore() {
        int hour = java.time.LocalTime.now().getHour();
        int score = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) ? 78 : 55;
        return Map.of("score", score, "level", score >= 75 ? "HIGH" : "MEDIUM",
                "recommendation", "ML service is starting up. This is a fallback prediction.");
    }

    private Map<String, Object> fallbackBurnoutRisk() {
        return Map.of("score", 25, "level", "LOW",
                "recommendations", List.of("ML service is starting up. Monitor your work patterns."));
    }
}
