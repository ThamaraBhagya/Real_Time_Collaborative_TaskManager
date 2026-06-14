// src/main/java/com/taskflow/board/dto/UpdateMemberRoleRequest.java
package com.taskflow.taskflow_api.board.dto;
import com.taskflow.taskflow_api.board.BoardRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMemberRoleRequest {
    @NotNull
    private BoardRole role;
}