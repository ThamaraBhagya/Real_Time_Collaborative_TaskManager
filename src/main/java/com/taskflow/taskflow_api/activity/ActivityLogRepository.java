// src/main/java/com/taskflow/activity/ActivityLogRepository.java
package com.taskflow.taskflow_api.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    @Query("""
        SELECT a FROM ActivityLog a
        JOIN FETCH a.user
        WHERE a.boardId = :boardId
        ORDER BY a.createdAt DESC
    """)
    Page<ActivityLog> findByBoardId(@Param("boardId") UUID boardId, Pageable pageable);
}