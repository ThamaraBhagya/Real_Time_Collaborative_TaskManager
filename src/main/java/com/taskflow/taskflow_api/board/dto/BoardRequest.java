// src/main/java/com/taskflow/board/dto/BoardRequest.java
package com.taskflow.taskflow_api.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BoardRequest {
    @NotBlank
    private String name;
    private String description;
}