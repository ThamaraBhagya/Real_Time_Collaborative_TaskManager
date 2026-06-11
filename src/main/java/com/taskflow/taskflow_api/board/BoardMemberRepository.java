// src/main/java/com/taskflow/board/BoardMemberRepository.java
package com.taskflow.taskflow_api.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BoardMemberRepository extends JpaRepository<BoardMember, BoardMemberId> {
    Optional<BoardMember> findByBoardIdAndUserId(UUID boardId, UUID userId);
    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);
}