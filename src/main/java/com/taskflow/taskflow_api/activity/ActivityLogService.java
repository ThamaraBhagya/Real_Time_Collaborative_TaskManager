// src/main/java/com/taskflow/activity/ActivityLogService.java
package com.taskflow.taskflow_api.activity;

import com.taskflow.taskflow_api.board.BoardService;
import com.taskflow.taskflow_api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final BoardService boardService;

    // @Async so it never slows down the main request thread
    @Async
    public void log(UUID boardId, User user, String action,
                    Map<String, Object> payload) {
        activityLogRepository.save(ActivityLog.builder()
                .boardId(boardId)
                .user(user)
                .action(action)
                .payload(payload)
                .build());
    }

    public List<ActivityLogResponse> getBoardActivity(UUID boardId,
                                                      User currentUser,
                                                      int page) {
        boardService.assertMember(boardId, currentUser.getId());

        return activityLogRepository
                .findByBoardId(boardId, PageRequest.of(page, 30))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ActivityLogResponse toResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .boardId(log.getBoardId())
                .userId(log.getUser().getId())
                .username(log.getUser().getUsername())
                .avatarUrl(log.getUser().getAvatarUrl())
                .action(log.getAction())
                .payload(log.getPayload())
                .createdAt(log.getCreatedAt())
                .build();
    }
}