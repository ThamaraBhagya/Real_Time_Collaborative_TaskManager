// src/main/java/com/taskflow/auth/dto/LoginRequest.java
package com.taskflow.taskflow_api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}