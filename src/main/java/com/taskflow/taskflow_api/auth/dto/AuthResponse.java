// src/main/java/com/taskflow/auth/dto/AuthResponse.java
package com.taskflow.taskflow_api.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @Builder @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UUID userId;
    private String email;
    private String username;
}