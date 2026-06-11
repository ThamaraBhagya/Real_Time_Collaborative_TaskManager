// src/main/java/com/taskflow/board/dto/BoardResponse.java
package com.taskflow.taskflow_api.board.dto;

import com.taskflow.taskflow_api.board.BoardRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder
public class BoardResponse {
    private UUID id;
    private String name;
    private String description;
    private UUID ownerId;
    private String ownerUsername;
    private List<ColumnResponse> columns;
    private List<MemberResponse> members;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class MemberResponse {
        private UUID userId;
        private String username;
        private String avatarUrl;
        private BoardRole role;
    }

    @Data @Builder
    public static class ColumnResponse {
        private UUID id;
        private String name;
        private Integer position;
        private List<CardSummary> cards;
    }

    @Data @Builder
    public static class CardSummary {
        private UUID id;
        private String title;
        private Integer position;
        private String priority;
        private String assigneeUsername;
        private LocalDateTime dueDate;
    }
}