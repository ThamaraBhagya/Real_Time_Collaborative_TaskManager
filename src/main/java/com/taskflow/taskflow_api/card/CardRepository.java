// src/main/java/com/taskflow/card/CardRepository.java
package com.taskflow.taskflow_api.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {

    List<Card> findByColumnIdOrderByPositionAsc(UUID columnId);

    int countByColumnId(UUID columnId);

    // Shift cards down to make room when inserting at a position
    @Modifying
    @Query("UPDATE Card c SET c.position = c.position + 1 WHERE c.column.id = :columnId AND c.position >= :position")
    void shiftCardsDown(@Param("columnId") UUID columnId, @Param("position") int position);

    // Shift cards up to fill gap when a card is removed
    @Modifying
    @Query("UPDATE Card c SET c.position = c.position - 1 WHERE c.column.id = :columnId AND c.position > :position")
    void shiftCardsUp(@Param("columnId") UUID columnId, @Param("position") int position);
}