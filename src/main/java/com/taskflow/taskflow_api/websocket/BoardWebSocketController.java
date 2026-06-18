// src/main/java/com/taskflow/websocket/BoardWebSocketController.java
package com.taskflow.taskflow_api.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class BoardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;


    // Everyone on that board sees who is typing
    @MessageMapping("/board/{boardId}/typing")
    public void handleTyping(@DestinationVariable UUID boardId,
                             @Payload Map<String, String> payload,
                             SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes()
                .getOrDefault("username", "unknown");

        messagingTemplate.convertAndSend(
                "/topic/board/" + boardId + "/presence",
                // 🟢 FIXED: Added (Object) cast to stop the Java compiler from getting confused!
                (Object) Map.of("type", "TYPING", "username", username,
                        "cardId", payload.getOrDefault("cardId", ""))
        );
    }


    // Announces a user has opened the board
    @MessageMapping("/board/{boardId}/join")
    public void handleJoin(@DestinationVariable UUID boardId,
                           SimpMessageHeaderAccessor headerAccessor) {
        String username = (String) headerAccessor.getSessionAttributes()
                .getOrDefault("username", "unknown");

        messagingTemplate.convertAndSend(
                "/topic/board/" + boardId + "/presence",

                (Object) Map.of("type", "USER_JOINED", "username", username)
        );
        log.debug("User {} joined board {}", username, boardId);
    }
}