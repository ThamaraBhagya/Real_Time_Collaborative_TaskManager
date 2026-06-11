// src/main/java/com/taskflow/board/dto/AddMemberRequest.java
package com.taskflow.taskflow_api.board.dto;

import com.taskflow.taskflow_api.board.BoardRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotBlank
    private String username;
    @NotNull
    private BoardRole role;
}