// src/main/java/com/taskflow/websocket/BoardEventSubscriber.java
package com.taskflow.taskflow_api.websocket;

import tools.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BoardEventSubscriber {

    private final SimpMessagingTemplate messagingTemplate;
    private final JsonMapper redisObjectMapper;

    // Called by Redis MessageListenerAdapter when a message arrives
    public void onMessage(String message, String channel) {
        try {
            BoardEvent event = redisObjectMapper.readValue(message, BoardEvent.class);

            // Push to WebSocket topic — all browsers subscribed to this board receive it
            String destination = "/topic/board/" + event.getBoardId();
            messagingTemplate.convertAndSend(destination, event);

            log.debug("Pushed event {} to {}", event.getType(), destination);
        } catch (Exception e) {
            log.error("Failed to process board event from Redis channel {}: {}", channel, e.getMessage());
        }
    }
}