
package com.taskflow.taskflow_api.card;

import com.taskflow.taskflow_api.card.dto.*;
import com.taskflow.taskflow_api.common.response.ApiResponse;
import com.taskflow.taskflow_api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping("/columns/{columnId}/cards")
    public ResponseEntity<ApiResponse<CardResponse>> createCard(
            @PathVariable UUID columnId,
            @Valid @RequestBody CardRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(cardService.createCard(columnId, request, currentUser)));
    }

    @PatchMapping("/cards/{cardId}")
    public ResponseEntity<ApiResponse<CardResponse>> updateCard(
            @PathVariable UUID cardId,
            @Valid @RequestBody CardRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.updateCard(cardId, request, currentUser)));
    }

    @PatchMapping("/cards/{cardId}/move")
    public ResponseEntity<ApiResponse<CardResponse>> moveCard(
            @PathVariable UUID cardId,
            @Valid @RequestBody CardMoveRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(cardService.moveCard(cardId, request, currentUser)));
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<Void> deleteCard(
            @PathVariable UUID cardId,
            @AuthenticationPrincipal User currentUser) {
        cardService.deleteCard(cardId, currentUser);
        return ResponseEntity.noContent().build();
    }
}