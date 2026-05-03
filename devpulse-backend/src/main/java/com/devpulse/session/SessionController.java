package com.devpulse.session;

import com.devpulse.user.User;
import com.devpulse.user.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    @PostMapping("/start")
    public ResponseEntity<?> startSession(@RequestBody StartRequest req, Authentication auth) {
        User user = getUser(auth);

        // Check for existing active session
        Optional<CodingSession> active = sessionRepository.findByUserIdAndStatus(user.getId(), CodingSession.SessionStatus.ACTIVE);
        if (active.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already have an active session"));
        }

        CodingSession session = CodingSession.builder()
                .userId(user.getId())
                .projectTag(req.getProjectTag())
                .language(req.getLanguage())
                .notes(req.getNotes())
                .startedAt(LocalDateTime.now())
                .status(CodingSession.SessionStatus.ACTIVE)
                .build();

        SessionEvent event = SessionEvent.builder()
                .session(session)
                .eventType(SessionEvent.EventType.STARTED)
                .build();
        session.getEvents().add(event);

        sessionRepository.save(session);
        return ResponseEntity.ok(mapSession(session));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<?> stopSession(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        CodingSession session = sessionRepository.findById(id).orElse(null);
        if (session == null || !session.getUserId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }

        session.setEndedAt(LocalDateTime.now());
        session.setDurationMins((int) Duration.between(session.getStartedAt(), session.getEndedAt()).toMinutes());
        session.setStatus(CodingSession.SessionStatus.COMPLETED);
        session.setFocusScore(new Random().nextInt(40) + 55);  // ML service would set this

        SessionEvent event = SessionEvent.builder()
                .session(session)
                .eventType(SessionEvent.EventType.STOPPED)
                .build();
        session.getEvents().add(event);

        sessionRepository.save(session);
        return ResponseEntity.ok(mapSession(session));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<?> pauseSession(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        CodingSession session = sessionRepository.findById(id).orElse(null);
        if (session == null || !session.getUserId().equals(user.getId())) return ResponseEntity.notFound().build();

        session.setStatus(CodingSession.SessionStatus.PAUSED);
        session.getEvents().add(SessionEvent.builder().session(session).eventType(SessionEvent.EventType.PAUSED).build());
        sessionRepository.save(session);
        return ResponseEntity.ok(mapSession(session));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<?> resumeSession(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        CodingSession session = sessionRepository.findById(id).orElse(null);
        if (session == null || !session.getUserId().equals(user.getId())) return ResponseEntity.notFound().build();

        session.setStatus(CodingSession.SessionStatus.ACTIVE);
        session.getEvents().add(SessionEvent.builder().session(session).eventType(SessionEvent.EventType.RESUMED).build());
        sessionRepository.save(session);
        return ResponseEntity.ok(mapSession(session));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive(Authentication auth) {
        User user = getUser(auth);
        Optional<CodingSession> active = sessionRepository.findByUserIdAndStatus(user.getId(), CodingSession.SessionStatus.ACTIVE);
        return active.map(s -> ResponseEntity.ok(mapSession(s)))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        User user = getUser(auth);
        List<CodingSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        return ResponseEntity.ok(sessions.stream().map(this::mapSession).toList());
    }

    private User getUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    private Map<String, Object> mapSession(CodingSession s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("projectTag", s.getProjectTag());
        map.put("language", s.getLanguage());
        map.put("notes", s.getNotes());
        map.put("startedAt", s.getStartedAt().toString());
        map.put("endedAt", s.getEndedAt() != null ? s.getEndedAt().toString() : null);
        map.put("durationMins", s.getDurationMins());
        map.put("status", s.getStatus().name());
        map.put("focusScore", s.getFocusScore());
        map.put("events", s.getEvents().stream().map(e -> Map.of(
                "type", e.getEventType().name(),
                "at", e.getOccurredAt().toString()
        )).toList());
        return map;
    }

    @Data
    public static class StartRequest {
        private String projectTag;
        private String language;
        private String notes;
    }
}
