/*
  # Add messages field to conversations table

  1. Changes
    - Add `messages` JSONB column to conversations table
    - Add `is_pinned` BOOLEAN column for conversation pinning
    - Update index for better query performance

  2. Notes
    - The messages field stores the full conversation history as an array of message objects
    - Each message contains: role, content, timestamp, assistant_name, and optional messageType
    - This supports the DashboardChat component's message persistence requirements
*/

-- Add messages column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'messages'
  ) THEN
    ALTER TABLE conversations ADD COLUMN messages JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add is_pinned column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE conversations ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index for faster conversation queries by user
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
ON conversations(user_id, updated_at DESC);

-- Create index for pinned conversations
CREATE INDEX IF NOT EXISTS idx_conversations_pinned
ON conversations(user_id, is_pinned) WHERE is_pinned = TRUE;