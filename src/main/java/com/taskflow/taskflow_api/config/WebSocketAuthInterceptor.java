// src/main/java/com/taskflow/config/WebSocketAuthInterceptor.java
package com.taskflow.taskflow_api.config;

import com.taskflow.taskflow_api.auth.JwtService;
import com.taskflow.taskflow_api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            String token = servletRequest.getServletRequest().getParameter("token");

            if (token != null) {
                try {
                    String email = jwtService.extractUsername(token);
                    userRepository.findByEmail(email).ifPresent(user -> {
                        attributes.put("username", user.getUsername());
                        attributes.put("userId", user.getId());
                        attributes.put("user", user);
                    });
                } catch (Exception e) {
                    log.warn("Invalid WS token: {}", e.getMessage());
                }
            }
        }
        return true; // Still allow connection — controller checks attributes
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {}
}