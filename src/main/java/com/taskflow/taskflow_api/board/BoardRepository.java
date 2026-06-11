// src/main/java/com/taskflow/board/BoardRepository.java
package com.taskflow.taskflow_api.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    @Query("""
        SELECT DISTINCT b FROM Board b
        JOIN b.members m
        WHERE m.user.id = :userId
        ORDER BY b.createdAt DESC
    """)
    List<Board> findAllByMemberUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT b FROM Board b
        LEFT JOIN FETCH b.columns c
        LEFT JOIN FETCH b.members m
        WHERE b.id = :id
    """)
    Optional<Board> findByIdWithDetails(@Param("id") UUID id);
}