-- Enable realtime for chat functionality
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;

-- Add tables to realtime publication (ignore errors if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
END
$$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
END
$$; 