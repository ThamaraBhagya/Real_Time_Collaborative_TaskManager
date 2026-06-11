// src/main/java/com/taskflow/board/BoardColumn.java
package com.taskflow.taskflow_api.board;

import com.taskflow.taskflow_api.card.Card;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "board_columns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoardColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Integer position = 0;

    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    private Set<Card> cards = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}