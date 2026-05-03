package com.devpulse.task;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Builder.Default
    private Integer priority = 3;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Complexity complexity = Complexity.MEDIUM;

    private LocalDateTime deadline;
    private BigDecimal estimatedHrs;
    private BigDecimal actualHrs;
    private String projectTag;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum TaskStatus { TODO, IN_PROGRESS, DONE }
    public enum Complexity { LOW, MEDIUM, HIGH }
}
