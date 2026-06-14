// src/main/java/com/taskflow/board/BoardController.java
package com.taskflow.taskflow_api.board;

import com.taskflow.taskflow_api.board.dto.*;
import com.taskflow.taskflow_api.common.response.ApiResponse;
import com.taskflow.taskflow_api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<ApiResponse<BoardResponse>> createBoard(
            @Valid @RequestBody BoardRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(boardService.createBoard(request, currentUser)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BoardResponse>>> getMyBoards(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(boardService.getMyBoards(currentUser)));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<ApiResponse<BoardResponse>> getBoardById(
            @PathVariable UUID boardId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(boardService.getBoardById(boardId, currentUser)));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable UUID boardId,
            @AuthenticationPrincipal User currentUser) {
        boardService.deleteBoard(boardId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{boardId}/members")
    public ResponseEntity<ApiResponse<Void>> addMember(
            @PathVariable UUID boardId,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal User currentUser) {
        boardService.addMember(boardId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null, "Member added"));
    }

    @PostMapping("/{boardId}/columns")
    public ResponseEntity<ApiResponse<BoardResponse.ColumnResponse>> addColumn(
            @PathVariable UUID boardId,
            @Valid @RequestBody ColumnRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(boardService.addColumn(boardId, request, currentUser)));
    }

    @PatchMapping("/{boardId}")
    public ResponseEntity<ApiResponse<BoardResponse>> updateBoard(
            @PathVariable UUID boardId,
            @RequestBody UpdateBoardRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                boardService.updateBoard(boardId, request, currentUser)));
    }

    @DeleteMapping("/{boardId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID boardId,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {
        boardService.removeMember(boardId, userId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{boardId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            @PathVariable UUID boardId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            @AuthenticationPrincipal User currentUser) {
        boardService.updateMemberRole(boardId, userId, request.getRole(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null, "Role updated"));
    }

    @PatchMapping("/columns/{columnId}")
    public ResponseEntity<ApiResponse<BoardResponse.ColumnResponse>> renameColumn(
            @PathVariable UUID columnId,
            @RequestBody ColumnRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                boardService.renameColumn(columnId, request.getName(), currentUser)));
    }

    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<Void> deleteColumn(
            @PathVariable UUID columnId,
            @AuthenticationPrincipal User currentUser) {
        boardService.deleteColumn(columnId, currentUser);
        return ResponseEntity.noContent().build();
    }
}