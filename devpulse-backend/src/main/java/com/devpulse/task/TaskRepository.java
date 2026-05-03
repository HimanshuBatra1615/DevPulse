package com.devpulse.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByPriorityAscDeadlineAsc(Long userId);
    List<Task> findByUserIdAndStatus(Long userId, Task.TaskStatus status);
    long countByUserIdAndStatus(Long userId, Task.TaskStatus status);
}
