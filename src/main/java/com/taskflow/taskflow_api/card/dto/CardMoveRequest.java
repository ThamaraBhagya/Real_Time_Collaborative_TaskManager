
package com.taskflow.taskflow_api.card.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CardMoveRequest {
    @NotNull
    private UUID targetColumnId;
    @Min(0)
    private int newPosition;
}