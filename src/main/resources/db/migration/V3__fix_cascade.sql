-- Ensure cards deleted when column deleted
ALTER TABLE cards
DROP CONSTRAINT IF EXISTS cards_column_id_fkey,
    ADD CONSTRAINT cards_column_id_fkey
        FOREIGN KEY (column_id)
        REFERENCES board_columns(id)
        ON DELETE CASCADE;

-- Ensure columns deleted when board deleted
ALTER TABLE board_columns
DROP CONSTRAINT IF EXISTS board_columns_board_id_fkey,
    ADD CONSTRAINT board_columns_board_id_fkey
        FOREIGN KEY (board_id)
        REFERENCES boards(id)
        ON DELETE CASCADE;

-- Ensure activity logs deleted when board deleted
ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_board_id_fkey,
    ADD CONSTRAINT activity_logs_board_id_fkey
        FOREIGN KEY (board_id)
        REFERENCES boards(id)
        ON DELETE CASCADE;

-- Ensure card_labels cleaned up when card deleted
ALTER TABLE card_labels
DROP CONSTRAINT IF EXISTS card_labels_card_id_fkey,
    ADD CONSTRAINT card_labels_card_id_fkey
        FOREIGN KEY (card_id)
        REFERENCES cards(id)
        ON DELETE CASCADE;