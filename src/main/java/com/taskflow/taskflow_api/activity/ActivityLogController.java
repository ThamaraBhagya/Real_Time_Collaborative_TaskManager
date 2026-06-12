// src/main/java/com/taskflow/activity/ActivityLogController.java
package com.taskflow.taskflow_api.activity;

import com.taskflow.taskflow_api.common.response.ApiResponse;
import com.taskflow.taskflow_api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards/{boardId}/activity")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivity(
            @PathVariable UUID boardId,
            @RequestParam(defaultValue = "0") int page,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                activityLogService.getBoardActivity(boardId, currentUser, page)));
    }
}