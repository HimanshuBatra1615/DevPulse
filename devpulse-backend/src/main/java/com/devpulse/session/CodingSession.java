package com.devpulse.session;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "coding_sessions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CodingSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String projectTag;
    private String language;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationMins;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE;

    private Integer focusScore;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<SessionEvent> events = new ArrayList<>();

    public enum SessionStatus { ACTIVE, PAUSED, COMPLETED, ABANDONED }
}
