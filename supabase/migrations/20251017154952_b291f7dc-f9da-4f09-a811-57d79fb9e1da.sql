-- Remove the username_length constraint completely
-- The handle_new_user() function already handles username length properly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS username_length;