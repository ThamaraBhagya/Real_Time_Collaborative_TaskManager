// src/main/java/com/taskflow/websocket/BoardEvent.java
package com.taskflow.taskflow_api.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BoardEvent {

    private EventType type;
    private UUID boardId;
    private UUID actorId;
    private String actorUsername;
    private Object payload;   // CardResponse, ColumnResponse, etc.
    private LocalDateTime timestamp;

    public enum EventType {
        CARD_CREATED,
        CARD_UPDATED,
        CARD_MOVED,
        CARD_DELETED,
        COLUMN_CREATED,
        COLUMN_DELETED,
        MEMBER_ADDED,
        BOARD_UPDATED
    }

    public static BoardEvent of(EventType type, UUID boardId,
                                UUID actorId, String actorUsername,
                                Object payload) {
        return BoardEvent.builder()
                .type(type)
                .boardId(boardId)
                .actorId(actorId)
                .actorUsername(actorUsername)
                .payload(payload)
                .timestamp(LocalDateTime.now())
                .build();
    }
}