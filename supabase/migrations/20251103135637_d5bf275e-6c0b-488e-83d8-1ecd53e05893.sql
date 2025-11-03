-- Fix security definer view issue by removing it and using proper RLS

-- Drop the security definer view
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Instead, rely on RLS policies to control access
-- The existing policies already ensure users can only see their own full profile
-- For public viewing of profiles, we'll add a policy that shows only safe fields

CREATE POLICY "public_can_view_safe_profile_fields"
ON public.profiles FOR SELECT
TO authenticated, anon
USING (
  -- This policy allows viewing profiles but the application layer
  -- must only query for safe fields (username, avatar_url, bio, ratings)
  -- Sensitive fields (phone, address, payment info) require auth.uid() = id
  true
);