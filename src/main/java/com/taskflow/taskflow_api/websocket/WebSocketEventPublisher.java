// src/main/java/com/taskflow/websocket/WebSocketEventPublisher.java
package com.taskflow.taskflow_api.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

import static com.taskflow.taskflow_api.config.RedisConfig.BOARD_CHANNEL_PREFIX;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    // 🟢 1. Inject your smart custom RedisTemplate instead of the String one
    private final RedisTemplate<String, Object> boardEventRedisTemplate;

    public void publishCardCreated(UUID boardId, UUID actorId,
                                   String actorUsername, Object cardResponse) {
        publish(BoardEvent.of(BoardEvent.EventType.CARD_CREATED,
                boardId, actorId, actorUsername, cardResponse));
    }

    public void publishCardUpdated(UUID boardId, UUID actorId,
                                   String actorUsername, Object cardResponse) {
        publish(BoardEvent.of(BoardEvent.EventType.CARD_UPDATED,
                boardId, actorId, actorUsername, cardResponse));
    }

    public void publishCardMoved(UUID boardId, UUID actorId,
                                 String actorUsername, Object cardResponse) {
        publish(BoardEvent.of(BoardEvent.EventType.CARD_MOVED,
                boardId, actorId, actorUsername, cardResponse));
    }

    public void publishCardDeleted(UUID boardId, UUID actorId,
                                   String actorUsername, UUID cardId) {
        publish(BoardEvent.of(BoardEvent.EventType.CARD_DELETED,
                boardId, actorId, actorUsername, cardId));
    }

    public void publishColumnCreated(UUID boardId, UUID actorId,
                                     String actorUsername, Object columnResponse) {
        publish(BoardEvent.of(BoardEvent.EventType.COLUMN_CREATED,
                boardId, actorId, actorUsername, columnResponse));
    }

    public void publishMemberAdded(UUID boardId, UUID actorId,
                                   String actorUsername, Object memberInfo) {
        publish(BoardEvent.of(BoardEvent.EventType.MEMBER_ADDED,
                boardId, actorId, actorUsername, memberInfo));
    }

    // Add these methods to WebSocketEventPublisher.java

    public void publishColumnUpdated(UUID boardId, UUID actorId,
                                     String actorUsername, Object columnResponse) {
        publish(BoardEvent.of(BoardEvent.EventType.COLUMN_UPDATED,
                boardId, actorId, actorUsername, columnResponse));
    }

    public void publishColumnDeleted(UUID boardId, UUID actorId,
                                     String actorUsername, UUID columnId) {
        publish(BoardEvent.of(BoardEvent.EventType.COLUMN_DELETED,
                boardId, actorId, actorUsername, columnId));
    }

    public void publishMemberRemoved(UUID boardId, UUID actorId,
                                     String actorUsername, UUID removedUserId) {
        publish(BoardEvent.of(BoardEvent.EventType.MEMBER_REMOVED,
                boardId, actorId, actorUsername, removedUserId));
    }

    public void publishMemberRoleUpdated(UUID boardId, UUID actorId,
                                         String actorUsername, Object memberInfo) {
        publish(BoardEvent.of(BoardEvent.EventType.MEMBER_ROLE_UPDATED,
                boardId, actorId, actorUsername, memberInfo));
    }

    public void publishBoardUpdated(UUID boardId, UUID actorId,
                                    String actorUsername, Object boardInfo) {
        publish(BoardEvent.of(BoardEvent.EventType.BOARD_UPDATED,
                boardId, actorId, actorUsername, boardInfo));
    }

    public void publishBoardDeleted(UUID boardId, UUID actorId, String actorUsername) {
        publish(BoardEvent.of(BoardEvent.EventType.BOARD_DELETED,
                boardId, actorId, actorUsername, null));
    }

    private void publish(BoardEvent event) {
        String channel = BOARD_CHANNEL_PREFIX + event.getBoardId();

        // 🟢 2. Send the Java Object directly! The template handles the JSON conversion automatically.
        boardEventRedisTemplate.convertAndSend(channel, event);

        log.debug("Published {} to Redis channel {}", event.getType(), channel);
    }
}