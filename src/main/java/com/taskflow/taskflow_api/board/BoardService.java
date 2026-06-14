// src/main/java/com/taskflow/board/BoardService.java
package com.taskflow.taskflow_api.board;

import com.taskflow.taskflow_api.board.dto.*;
import com.taskflow.taskflow_api.user.User;
import com.taskflow.taskflow_api.user.UserRepository;
import com.taskflow.taskflow_api.websocket.WebSocketEventPublisher;
import com.taskflow.taskflow_api.activity.ActivityLogService; // 🟢 IMPORT ADDED
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final UserRepository userRepository;
    private final WebSocketEventPublisher eventPublisher;

    // 🟢 INJECTED ACTIVITY LOG SERVICE
    private final ActivityLogService activityLogService;

    @Transactional
    public BoardResponse createBoard(BoardRequest request, User currentUser) {
        Board board = Board.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();
        boardRepository.saveAndFlush(board);

        // Creator is automatically an ADMIN member
        BoardMember member = BoardMember.builder()
                .board(board)
                .user(currentUser)
                .role(BoardRole.ADMIN)
                .build();
        boardMemberRepository.save(member);

        // Create default columns
        String[] defaultColumns = {"To Do", "In Progress", "Done"};
        for (int i = 0; i < defaultColumns.length; i++) {
            boardColumnRepository.save(BoardColumn.builder()
                    .board(board)
                    .name(defaultColumns[i])
                    .position(i)
                    .build());
        }

        // 🟢 LOG: Board Creation
        activityLogService.log(board.getId(), currentUser, "BOARD_CREATED",
                Map.of("name", board.getName()));

        return getBoardById(board.getId(), currentUser);
    }

    public List<BoardResponse> getMyBoards(User currentUser) {
        return boardRepository.findAllByMemberUserId(currentUser.getId())
                .stream()
                .map(b -> BoardResponse.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .description(b.getDescription())
                        .ownerId(b.getOwner().getId())
                        .ownerUsername(b.getOwner().getUsername())
                        .createdAt(b.getCreatedAt())
                        .build())
                .toList();
    }

    public BoardResponse getBoardById(UUID boardId, User currentUser) {
        Board board = boardRepository.findByIdWithColumns(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // Members loaded in a second query automatically via findByIdWithMembers
        Board boardWithMembers = boardRepository.findByIdWithMembers(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        assertMember(boardId, currentUser.getId());

        List<BoardResponse.ColumnResponse> columns = board.getColumns().stream()
                .sorted(Comparator.comparingInt(BoardColumn::getPosition))
                .map(col -> BoardResponse.ColumnResponse.builder()
                        .id(col.getId())
                        .name(col.getName())
                        .position(col.getPosition())
                        .cards(col.getCards().stream()
                                .map(card -> BoardResponse.CardSummary.builder()
                                        .id(card.getId())
                                        .title(card.getTitle())
                                        .position(card.getPosition())
                                        .priority(card.getPriority().name())
                                        .assigneeUsername(card.getAssignee() != null
                                                ? card.getAssignee().getUsername() : null)
                                        .dueDate(card.getDueDate())
                                        .build())
                                .toList())
                        .build())
                .toList();

        List<BoardResponse.MemberResponse> members = boardWithMembers.getMembers().stream()
                .map(m -> BoardResponse.MemberResponse.builder()
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .avatarUrl(m.getUser().getAvatarUrl())
                        .role(m.getRole())
                        .build())
                .toList();

        return BoardResponse.builder()
                .id(board.getId())
                .name(board.getName())
                .description(board.getDescription())
                .ownerId(board.getOwner().getId())
                .ownerUsername(board.getOwner().getUsername())
                .columns(columns)
                .members(members)
                .createdAt(board.getCreatedAt())
                .build();
    }

    @Transactional
    public void addMember(UUID boardId, AddMemberRequest request, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN);

        User userToAdd = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, userToAdd.getId())) {
            throw new RuntimeException("User is already a member");
        }

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        boardMemberRepository.save(BoardMember.builder()
                .board(board)
                .user(userToAdd)
                .role(request.getRole())
                .build());

        // 🟢 ADDED LOG HERE
        activityLogService.log(boardId, currentUser, "MEMBER_ADDED",
                Map.of("username", userToAdd.getUsername(), "role", request.getRole()));

        eventPublisher.publishMemberAdded(boardId, currentUser.getId(),
                currentUser.getUsername(),
                BoardResponse.MemberResponse.builder()
                        .userId(userToAdd.getId())
                        .username(userToAdd.getUsername())
                        .avatarUrl(userToAdd.getAvatarUrl())
                        .role(request.getRole())
                        .build());
    }

    @Transactional
    public BoardResponse.ColumnResponse addColumn(UUID boardId, ColumnRequest request, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN, BoardRole.MEMBER);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        int nextPosition = boardColumnRepository.countByBoardId(boardId);

        BoardColumn column = boardColumnRepository.save(BoardColumn.builder()
                .board(board)
                .name(request.getName())
                .position(nextPosition)
                .build());

        BoardResponse.ColumnResponse columnResponse = BoardResponse.ColumnResponse.builder()
                .id(column.getId())
                .name(column.getName())
                .position(column.getPosition())
                .cards(List.of())
                .build();

        // 🟢 LOG: Column Creation
        activityLogService.log(boardId, currentUser, "COLUMN_CREATED",
                Map.of("name", column.getName()));

        eventPublisher.publishColumnCreated(boardId, currentUser.getId(),
                currentUser.getUsername(), columnResponse);

        return columnResponse;
    }

    @Transactional
    public void deleteBoard(UUID boardId, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN);

        // 🟢 1. Database eken makanna KALIN event eka broadcast karanna
        eventPublisher.publishBoardDeleted(boardId, currentUser.getId(), currentUser.getUsername());

        // 🟢 2. Log the activity
        activityLogService.log(boardId, currentUser, "BOARD_DELETED", Map.of());

        // 🟢 3. Delete from Database
        boardRepository.deleteById(boardId);
    }

    // --- Permission helpers ---

    public void assertMember(UUID boardId, UUID userId) {
        if (!boardMemberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            throw new RuntimeException("Access denied: not a board member");
        }
    }

    public void assertRole(UUID boardId, UUID userId, BoardRole... allowedRoles) {
        BoardMember member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new RuntimeException("Access denied: not a board member"));

        for (BoardRole role : allowedRoles) {
            if (member.getRole() == role) return;
        }
        throw new RuntimeException("Access denied: insufficient role");
    }

    @Transactional
    public BoardResponse updateBoard(UUID boardId, UpdateBoardRequest request, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN);
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        if (request.getName() != null && !request.getName().isBlank())
            board.setName(request.getName());
        if (request.getDescription() != null)
            board.setDescription(request.getDescription());
        board.setUpdatedAt(LocalDateTime.now());

        boardRepository.save(board);

        // 🟢 ADDED LOG HERE
        activityLogService.log(boardId, currentUser, "BOARD_UPDATED",
                Map.of("name", board.getName()));

        eventPublisher.publishBoardUpdated(boardId, currentUser.getId(),
                currentUser.getUsername(),
                Map.of("name", board.getName(),
                        "description", board.getDescription() != null
                                ? board.getDescription() : ""));

        return getBoardById(boardId, currentUser);
    }

    @Transactional
    public void removeMember(UUID boardId, UUID targetUserId, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN);
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        if (board.getOwner().getId().equals(targetUserId))
            throw new RuntimeException("Cannot remove the board owner");

        eventPublisher.publishMemberRemoved(boardId, currentUser.getId(),
                currentUser.getUsername(), targetUserId);

        boardMemberRepository.deleteById(new BoardMemberId(boardId, targetUserId));

        // 🟢 ADDED LOG HERE
        activityLogService.log(boardId, currentUser, "MEMBER_REMOVED",
                Map.of("userId", targetUserId.toString()));
    }

    @Transactional
    public void updateMemberRole(UUID boardId, UUID targetUserId,
                                 BoardRole newRole, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN);
        BoardMember member = boardMemberRepository
                .findByBoardIdAndUserId(boardId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setRole(newRole);

        boardMemberRepository.save(member);

        // 🟢 ADDED LOG HERE
        activityLogService.log(boardId, currentUser, "MEMBER_ROLE_UPDATED",
                Map.of("userId", targetUserId.toString(), "role", newRole.name()));

        eventPublisher.publishMemberRoleUpdated(boardId, currentUser.getId(),
                currentUser.getUsername(),
                Map.of("userId", targetUserId, "role", newRole));
    }

    @Transactional
    public BoardResponse.ColumnResponse renameColumn(UUID columnId,
                                                     String name, User currentUser) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));
        assertRole(column.getBoard().getId(), currentUser.getId(),
                BoardRole.ADMIN, BoardRole.MEMBER);
        column.setName(name);

        boardColumnRepository.save(column);

        // 🟢 ADDED LOG HERE
        activityLogService.log(column.getBoard().getId(), currentUser, "COLUMN_UPDATED",
                Map.of("columnId", column.getId().toString(), "name", name));

        eventPublisher.publishColumnUpdated(column.getBoard().getId(),
                currentUser.getId(), currentUser.getUsername(),
                Map.of("id", column.getId(), "name", name));

        return BoardResponse.ColumnResponse.builder()
                .id(column.getId()).name(name)
                .position(column.getPosition()).cards(List.of()).build();
    }

    @Transactional
    public void deleteColumn(UUID columnId, User currentUser) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));
        assertRole(column.getBoard().getId(), currentUser.getId(), BoardRole.ADMIN);

        eventPublisher.publishColumnDeleted(column.getBoard().getId(),
                currentUser.getId(), currentUser.getUsername(), columnId);

        // 🟢 ADDED LOG HERE
        activityLogService.log(column.getBoard().getId(), currentUser, "COLUMN_DELETED",
                Map.of("columnId", columnId.toString(), "name", column.getName()));

        boardColumnRepository.delete(column);
    }
}