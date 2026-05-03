package com.devpulse.analytics;

import com.devpulse.session.SessionRepository;
import com.devpulse.task.TaskRepository;
import com.devpulse.task.Task;
import com.devpulse.user.User;
import com.devpulse.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class AnalyticsController {

    private final SessionRepository sessionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping("/api/analytics/dashboard")
    public ResponseEntity<?> dashboardStats(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        int totalSessions = (int) sessionRepository.countByUserId(user.getId());
        int weekMinutes = sessionRepository.totalMinutesSince(user.getId(), weekAgo);
        int todayMinutes = sessionRepository.totalMinutesSince(user.getId(), todayStart);
        long completedTasks = taskRepository.countByUserIdAndStatus(user.getId(), Task.TaskStatus.DONE);
        long totalTasks = taskRepository.findByUserIdOrderByPriorityAscDeadlineAsc(user.getId()).size();

        return ResponseEntity.ok(Map.of(
                "totalSessions", totalSessions,
                "weekHours", Math.round(weekMinutes / 60.0 * 10) / 10.0,
                "todayHours", Math.round(todayMinutes / 60.0 * 10) / 10.0,
                "completedTasks", completedTasks,
                "totalTasks", totalTasks,
                "taskCompletionRate", totalTasks > 0 ? Math.round(completedTasks * 100.0 / totalTasks) : 0
        ));
    }

    @GetMapping("/api/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> platformStats() {
        long totalUsers = userRepository.count();
        long totalSessions = sessionRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalSessions", totalSessions
        ));
    }
}
