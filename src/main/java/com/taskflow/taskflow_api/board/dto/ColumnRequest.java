// src/main/java/com/taskflow/board/dto/ColumnRequest.java
package com.taskflow.taskflow_api.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ColumnRequest {
    @NotBlank
    private String name;
}