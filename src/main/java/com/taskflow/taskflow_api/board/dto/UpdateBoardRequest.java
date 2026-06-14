// src/main/java/com/taskflow/board/dto/UpdateBoardRequest.java
package com.taskflow.taskflow_api.board.dto;
import lombok.Data;

@Data
public class UpdateBoardRequest {
    private String name;
    private String description;
}