-- Create a function to check if user is part of chat (with SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chats
    WHERE id = chat_uuid
    AND (buyer_id = user_uuid OR seller_id = user_uuid)
  );
END;
$$;

-- Drop existing policies on messages table
DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;

-- Create new improved policies
CREATE POLICY "Users can send messages in their chats"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND is_chat_participant(chat_id, auth.uid())
);

CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
USING (
  is_chat_participant(chat_id, auth.uid())
);