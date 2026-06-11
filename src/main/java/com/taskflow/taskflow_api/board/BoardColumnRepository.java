// src/main/java/com/taskflow/board/BoardColumnRepository.java
package com.taskflow.taskflow_api.board;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {
    List<BoardColumn> findByBoardIdOrderByPositionAsc(UUID boardId);
    int countByBoardId(UUID boardId);
}