// src/main/java/com/taskflow/board/BoardService.java
package com.taskflow.taskflow_api.board;

import com.taskflow.taskflow_api.board.dto.*;
import com.taskflow.taskflow_api.user.User;
import com.taskflow.taskflow_api.user.UserRepository;
import com.taskflow.taskflow_api.websocket.WebSocketEventPublisher; // 🟢 IMPORT ADDED
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final UserRepository userRepository;

    // 🟢 1. INJECTED THE PUBLISHER HERE
    private final WebSocketEventPublisher eventPublisher;

    @Transactional
    public BoardResponse createBoard(BoardRequest request, User currentUser) {
        Board board = Board.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();
        boardRepository.save(board);

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


        eventPublisher.publishColumnCreated(boardId, currentUser.getId(),
                currentUser.getUsername(), columnResponse);


        return columnResponse;
    }

    @Transactional
    public void deleteBoard(UUID boardId, User currentUser) {
        assertRole(boardId, currentUser.getId(), BoardRole.ADMIN);
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
}