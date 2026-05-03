package com.devpulse.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<CodingSession, Long> {
    List<CodingSession> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<CodingSession> findByUserIdAndStatus(Long userId, CodingSession.SessionStatus status);

    @Query("SELECT s FROM CodingSession s WHERE s.userId = :userId AND s.startedAt >= :since ORDER BY s.startedAt DESC")
    List<CodingSession> findRecentByUserId(Long userId, java.time.LocalDateTime since);

    @Query("SELECT COALESCE(SUM(s.durationMins), 0) FROM CodingSession s WHERE s.userId = :userId AND s.startedAt >= :since")
    Integer totalMinutesSince(Long userId, java.time.LocalDateTime since);

    long countByUserId(Long userId);
}
