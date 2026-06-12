// src/main/java/com/taskflow/card/CardService.java
package com.taskflow.taskflow_api.card;

import com.taskflow.taskflow_api.activity.ActivityLogService;
import com.taskflow.taskflow_api.board.BoardColumn;
import com.taskflow.taskflow_api.board.BoardColumnRepository;
import com.taskflow.taskflow_api.board.BoardService;
import com.taskflow.taskflow_api.card.dto.*;
import com.taskflow.taskflow_api.user.User;
import com.taskflow.taskflow_api.user.UserRepository;
import com.taskflow.taskflow_api.websocket.WebSocketEventPublisher;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final BoardService boardService;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    // 🟢 Injected the Publisher
    private final WebSocketEventPublisher eventPublisher;

    @Transactional
    public CardResponse createCard(UUID columnId, CardRequest request, User currentUser) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        boardService.assertMember(column.getBoard().getId(), currentUser.getId());

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        int position = cardRepository.countByColumnId(columnId);

        Card card = cardRepository.save(Card.builder()
                .column(column)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .assignee(assignee)
                .createdBy(currentUser)
                .dueDate(request.getDueDate())
                .position(position)
                .build());

        // 🟢 Broadcast the event
        UUID boardId = column.getBoard().getId();
        CardResponse response = toResponse(card);
        eventPublisher.publishCardCreated(boardId, currentUser.getId(),
                currentUser.getUsername(), response);

        activityLogService.log(boardId, currentUser, "CARD_CREATED",
                Map.of("cardId", card.getId(), "cardTitle", card.getTitle(),
                        "columnId", column.getId(), "columnName", column.getName()));

        return response; // The duplicate return statement below this was removed
    }

    @Transactional
    public CardResponse updateCard(UUID cardId, CardRequest request, User currentUser) {
        Card card = getCardAndAssertAccess(cardId, currentUser);

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPriority(request.getPriority());
        card.setDueDate(request.getDueDate());
        card.setUpdatedAt(LocalDateTime.now());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            card.setAssignee(assignee);
        } else {
            card.setAssignee(null);
        }

        // 🟢 Broadcast the event after saving
        Card savedCard = cardRepository.save(card);
        UUID boardId = savedCard.getColumn().getBoard().getId();
        CardResponse response = toResponse(savedCard);

        eventPublisher.publishCardUpdated(boardId, currentUser.getId(),
                currentUser.getUsername(), response);
        activityLogService.log(boardId, currentUser, "CARD_UPDATED",
                Map.of("cardId", card.getId(), "cardTitle", card.getTitle()));

        return response;
    }

    @Transactional
    public CardResponse moveCard(UUID cardId, CardMoveRequest request, User currentUser) {
        Card card = getCardAndAssertAccess(cardId, currentUser);

        UUID sourceColumnId = card.getColumn().getId();
        UUID targetColumnId = request.getTargetColumnId();
        int newPosition = request.getNewPosition();

        // Remove from source column — shift remaining cards up
        cardRepository.shiftCardsUp(sourceColumnId, card.getPosition());

        // Make room in target column at the new position
        cardRepository.shiftCardsDown(targetColumnId, newPosition);

        // Move card
        if (!sourceColumnId.equals(targetColumnId)) {
            BoardColumn targetColumn = boardColumnRepository.findById(targetColumnId)
                    .orElseThrow(() -> new RuntimeException("Target column not found"));
            card.setColumn(targetColumn);
        }
        card.setPosition(newPosition);
        card.setUpdatedAt(LocalDateTime.now());

        // 🟢 Broadcast the event after saving
        Card savedCard = cardRepository.save(card);
        UUID boardId = savedCard.getColumn().getBoard().getId();
        CardResponse response = toResponse(savedCard);

        eventPublisher.publishCardMoved(boardId, currentUser.getId(),
                currentUser.getUsername(), response);

        activityLogService.log(boardId, currentUser, "CARD_MOVED",
                Map.of("cardId", card.getId(), "cardTitle", card.getTitle(),
                        "toColumnId", targetColumnId));

        return response;
    }

    @Transactional
    public void deleteCard(UUID cardId, User currentUser) {
        Card card = getCardAndAssertAccess(cardId, currentUser);
        cardRepository.shiftCardsUp(card.getColumn().getId(), card.getPosition());

        // 🟢 Broadcast the event BEFORE deleting it from the database
        UUID boardId = card.getColumn().getBoard().getId();
        eventPublisher.publishCardDeleted(boardId, currentUser.getId(),
                currentUser.getUsername(), card.getId());

        activityLogService.log(boardId, currentUser, "CARD_DELETED",
                Map.of("cardId", cardId, "cardTitle", card.getTitle()));

        cardRepository.delete(card);
    }

    private Card getCardAndAssertAccess(UUID cardId, User currentUser) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        boardService.assertMember(card.getColumn().getBoard().getId(), currentUser.getId());
        return card;
    }

    private CardResponse toResponse(Card card) {
        // ... (this method remains exactly the same)
        return CardResponse.builder()
                .id(card.getId())
                .columnId(card.getColumn().getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .position(card.getPosition())
                .priority(card.getPriority())
                .assigneeId(card.getAssignee() != null ? card.getAssignee().getId() : null)
                .assigneeUsername(card.getAssignee() != null ? card.getAssignee().getUsername() : null)
                .assigneeAvatarUrl(card.getAssignee() != null ? card.getAssignee().getAvatarUrl() : null)
                .createdById(card.getCreatedBy().getId())
                .dueDate(card.getDueDate())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}