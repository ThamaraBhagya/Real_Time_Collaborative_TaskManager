
package com.taskflow.taskflow_api.card.dto;

import com.taskflow.taskflow_api.card.CardPriority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class CardResponse {
    private UUID id;
    private UUID columnId;
    private String title;
    private String description;
    private Integer position;
    private CardPriority priority;
    private UUID assigneeId;
    private String assigneeUsername;
    private String assigneeAvatarUrl;
    private UUID createdById;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}