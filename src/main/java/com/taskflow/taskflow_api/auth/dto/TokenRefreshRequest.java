// src/main/java/com/taskflow/auth/dto/TokenRefreshRequest.java
package com.taskflow.taskflow_api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
    @NotBlank
    private String refreshToken;
}