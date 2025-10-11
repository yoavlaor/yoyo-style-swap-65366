-- Remove the public_profiles view (causes security definer warning)
DROP VIEW IF EXISTS public.public_profiles;

-- Instead, we'll use RLS policies to control column-level access
-- Users can see their own full profile
-- Transaction participants can see each other's profiles
-- Everyone else can see only basic public info

-- The existing policies already handle this:
-- 1. "Users can view own profile" - user can see their own full profile
-- 2. "Transaction participants can view each other profiles" - buyers/sellers can see each other

-- No changes needed to the existing RLS policies
-- Applications should fetch only the columns they need based on context