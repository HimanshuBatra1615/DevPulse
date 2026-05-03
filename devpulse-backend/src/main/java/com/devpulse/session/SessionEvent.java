package com.devpulse.session;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_events")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private CodingSession session;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    private String eventData;

    @Builder.Default
    private LocalDateTime occurredAt = LocalDateTime.now();

    public enum EventType { STARTED, PAUSED, RESUMED, STOPPED }
}
