-- Fix profiles table RLS to protect sensitive PII
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a policy that restricts access to sensitive fields
-- Users can see their own full profile
-- Others can only see basic public info (username, avatar, ratings, verification)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Create a view for public profile information (safe to share)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  bio,
  average_rating,
  total_ratings,
  is_face_verified,
  created_at
FROM public.profiles;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Policy to allow viewing public profiles through transactions
-- When users are in a transaction together (buyer/seller), they can see each other's contact info
CREATE POLICY "Transaction participants can view each other profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    AND (t.buyer_id = profiles.id OR t.seller_id = profiles.id)
  )
);

-- Add validation constraints to profiles table
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS username_length,
DROP CONSTRAINT IF EXISTS full_name_length,
DROP CONSTRAINT IF EXISTS bio_length,
DROP CONSTRAINT IF EXISTS phone_length;

ALTER TABLE public.profiles
ADD CONSTRAINT username_length CHECK (length(username) >= 3 AND length(username) <= 30),
ADD CONSTRAINT full_name_length CHECK (full_name IS NULL OR length(full_name) <= 100),
ADD CONSTRAINT bio_length CHECK (bio IS NULL OR length(bio) <= 500),
ADD CONSTRAINT phone_length CHECK (phone IS NULL OR length(phone) <= 20);

-- Improve handle_new_user function to validate and sanitize inputs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Sanitize and limit username (alphanumeric, underscore, hyphen only)
  v_username := COALESCE(
    substring(regexp_replace(new.raw_user_meta_data->>'username', '[^a-zA-Z0-9_-]', '', 'g'), 1, 30),
    substring(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g'), 1, 30)
  );
  
  -- Limit full_name length
  v_full_name := substring(
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    1, 100
  );
  
  -- Validate avatar_url is a URL or empty
  v_avatar_url := CASE 
    WHEN COALESCE(new.raw_user_meta_data->>'avatar_url', '') ~ '^https?://'
    THEN substring(new.raw_user_meta_data->>'avatar_url', 1, 500)
    ELSE ''
  END;
  
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, v_username, v_full_name, v_avatar_url);
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle duplicate username by appending part of user ID
    v_username := substring(v_username || '_' || substring(new.id::text, 1, 8), 1, 30);
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (new.id, v_username, v_full_name, v_avatar_url);
    RETURN new;
END;
$$;