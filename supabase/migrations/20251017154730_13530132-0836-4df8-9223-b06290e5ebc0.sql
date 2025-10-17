-- Remove the username length constraint that's causing issues
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS username_length;

-- Add a more flexible username constraint (allow up to 50 characters)
ALTER TABLE public.profiles ADD CONSTRAINT username_length CHECK (char_length(username) >= 1 AND char_length(username) <= 50);