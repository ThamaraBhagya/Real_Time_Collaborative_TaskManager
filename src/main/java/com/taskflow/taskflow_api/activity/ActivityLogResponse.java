
package com.taskflow.taskflow_api.activity;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data @Builder
public class ActivityLogResponse {
    private UUID id;
    private UUID boardId;
    private UUID userId;
    private String username;
    private String avatarUrl;
    private String action;
    private Map<String, Object> payload;
    private LocalDateTime createdAt;
}