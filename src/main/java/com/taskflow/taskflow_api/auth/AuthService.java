// src/main/java/com/taskflow/auth/AuthService.java
package com.taskflow.taskflow_api.auth;

import com.taskflow.taskflow_api.auth.dto.*;
import com.taskflow.taskflow_api.user.User;
import com.taskflow.taskflow_api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX     = "blacklist:";

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        // This throws if credentials are wrong — Spring handles it
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        // Check if token is blacklisted (user logged out)
        if (redisTemplate.hasKey(BLACKLIST_PREFIX + refreshToken)) {
            throw new RuntimeException("Refresh token has been revoked");
        }

        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate stored token matches what's in Redis
        String storedToken = redisTemplate.opsForValue()
                .get(REFRESH_TOKEN_PREFIX + user.getId());

        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Refresh token expired");
        }

        // Rotate: invalidate old refresh token, issue new pair
        blacklistToken(refreshToken);
        return buildAuthResponse(user);
    }

    public void logout(String refreshToken) {
        blacklistToken(refreshToken);
        String email = jwtService.extractUsername(refreshToken);
        userRepository.findByEmail(email).ifPresent(user ->
                redisTemplate.delete(REFRESH_TOKEN_PREFIX + user.getId())
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Store refresh token in Redis with 7-day TTL
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.getId(),
                refreshToken,
                Duration.ofDays(7)
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    private void blacklistToken(String token) {
        // Store in blacklist until it naturally expires (7 days)
        redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + token,
                "revoked",
                Duration.ofDays(7)
        );
    }
}