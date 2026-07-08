
package com.taskflow.taskflow_api.card.dto;

import com.taskflow.taskflow_api.card.CardPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CardRequest {
    @NotBlank
    private String title;
    private String description;
    private CardPriority priority = CardPriority.MEDIUM;
    private UUID assigneeId;
    private LocalDateTime dueDate;
}