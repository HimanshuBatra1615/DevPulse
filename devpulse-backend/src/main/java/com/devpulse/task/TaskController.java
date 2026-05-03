package com.devpulse.task;

import com.devpulse.user.User;
import com.devpulse.user.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getTasks(Authentication auth,
                                      @RequestParam(required = false) String status,
                                      @RequestParam(required = false) Integer priority) {
        User user = getUser(auth);
        List<Task> tasks;

        if (status != null) {
            tasks = taskRepository.findByUserIdAndStatus(user.getId(), Task.TaskStatus.valueOf(status));
        } else {
            tasks = taskRepository.findByUserIdOrderByPriorityAscDeadlineAsc(user.getId());
        }

        if (priority != null) {
            tasks = tasks.stream().filter(t -> t.getPriority().equals(priority)).toList();
        }

        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody CreateTaskRequest req, Authentication auth) {
        User user = getUser(auth);
        Task task = Task.builder()
                .userId(user.getId())
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority() != null ? req.getPriority() : 3)
                .complexity(req.getComplexity() != null ? Task.Complexity.valueOf(req.getComplexity()) : Task.Complexity.MEDIUM)
                .projectTag(req.getProjectTag())
                .estimatedHrs(req.getEstimatedHrs())
                .build();

        if (req.getDeadline() != null) {
            task.setDeadline(java.time.LocalDateTime.parse(req.getDeadline()));
        }

        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> updates, Authentication auth) {
        User user = getUser(auth);
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null || !task.getUserId().equals(user.getId())) return ResponseEntity.notFound().build();

        if (updates.containsKey("title")) task.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) task.setDescription((String) updates.get("description"));
        if (updates.containsKey("status")) task.setStatus(Task.TaskStatus.valueOf((String) updates.get("status")));
        if (updates.containsKey("priority")) task.setPriority((Integer) updates.get("priority"));
        if (updates.containsKey("projectTag")) task.setProjectTag((String) updates.get("projectTag"));
        task.setUpdatedAt(java.time.LocalDateTime.now());

        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        User user = getUser(auth);
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null || !task.getUserId().equals(user.getId())) return ResponseEntity.notFound().build();

        task.setStatus(Task.TaskStatus.valueOf(body.get("status")));
        task.setUpdatedAt(java.time.LocalDateTime.now());
        taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null || !task.getUserId().equals(user.getId())) return ResponseEntity.notFound().build();

        taskRepository.delete(task);
        return ResponseEntity.ok(Map.of("message", "Task deleted"));
    }

    private User getUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @Data
    public static class CreateTaskRequest {
        private String title;
        private String description;
        private Integer priority;
        private String complexity;
        private String projectTag;
        private java.math.BigDecimal estimatedHrs;
        private String deadline;
    }
}
