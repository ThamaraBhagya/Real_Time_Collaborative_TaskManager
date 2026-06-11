-- Users
CREATE TABLE users (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email       VARCHAR(255) NOT NULL UNIQUE,
                       username    VARCHAR(100) NOT NULL UNIQUE,
                       password    VARCHAR(255) NOT NULL,
                       avatar_url  VARCHAR(500),
                       created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                       updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Boards (a workspace like a Trello board)
CREATE TABLE boards (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name        VARCHAR(255) NOT NULL,
                        description TEXT,
                        owner_id    UUID NOT NULL REFERENCES users(id),
                        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Board members with roles
CREATE TABLE board_members (
                               board_id   UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
                               user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               role       VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- ADMIN, MEMBER, VIEWER
                               joined_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                               PRIMARY KEY (board_id, user_id)
);

-- Columns inside a board (e.g. "To Do", "In Progress", "Done")
CREATE TABLE board_columns (
                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
                               name        VARCHAR(255) NOT NULL,
                               position    INT NOT NULL DEFAULT 0,
                               created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cards inside columns
CREATE TABLE cards (
                       id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       column_id    UUID NOT NULL REFERENCES board_columns(id) ON DELETE CASCADE,
                       title        VARCHAR(500) NOT NULL,
                       description  TEXT,
                       position     INT NOT NULL DEFAULT 0,
                       assignee_id  UUID REFERENCES users(id),
                       due_date     TIMESTAMP,
                       priority     VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
                       created_by   UUID NOT NULL REFERENCES users(id),
                       created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
                       updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Card labels
CREATE TABLE labels (
                        id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
                        name     VARCHAR(100) NOT NULL,
                        color    VARCHAR(20) NOT NULL
);

CREATE TABLE card_labels (
                             card_id  UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
                             label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
                             PRIMARY KEY (card_id, label_id)
);

-- Activity log (feeds the real-time activity feed in the UI)
CREATE TABLE activity_logs (
                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
                               user_id     UUID NOT NULL REFERENCES users(id),
                               action      VARCHAR(100) NOT NULL,  -- CARD_MOVED, CARD_CREATED, etc.
                               payload     JSONB,
                               created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_cards_assignee  ON cards(assignee_id);
CREATE INDEX idx_activity_board  ON activity_logs(board_id, created_at DESC);