package com.devpulse.auth;

import lombok.Data;

@Data
public class RefreshToken {
    // Using in-memory for H2 dev mode
    private Long id;
    private String token;
    private Long userId;
    private java.time.LocalDateTime expiresAt;
    private boolean revoked;
}
