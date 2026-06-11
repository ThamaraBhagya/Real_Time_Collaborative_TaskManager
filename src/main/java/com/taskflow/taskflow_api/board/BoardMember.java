// src/main/java/com/taskflow/board/BoardMember.java
package com.taskflow.taskflow_api.board;

import com.taskflow.taskflow_api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "board_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(BoardMemberId.class)
public class BoardMember {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BoardRole role = BoardRole.MEMBER;

    @Column(name = "joined_at", updatable = false)
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}