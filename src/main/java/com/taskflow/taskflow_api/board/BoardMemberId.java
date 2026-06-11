// src/main/java/com/taskflow/board/BoardMemberId.java
package com.taskflow.taskflow_api.board;

import java.io.Serializable;
import java.util.UUID;

public class BoardMemberId implements Serializable {
    private UUID board;
    private UUID user;

    public BoardMemberId() {}
    public BoardMemberId(UUID board, UUID user) {
        this.board = board;
        this.user = user;
    }
}