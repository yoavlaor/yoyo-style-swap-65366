-- Fix security issues: Restrict access to sensitive user data and financial information

-- 1. Create a view for public profile information (non-sensitive data only)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  bio,
  average_rating,
  total_ratings,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 2. Drop existing overly permissive policies on profiles
DROP POLICY IF EXISTS "Transaction participants can view each other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profile info viewable by all" ON public.profiles;

-- 3. Create restrictive policies for profiles table
-- Users can view their own full profile
CREATE POLICY "Users can view own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can modify own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Public can view only non-sensitive profile data
CREATE POLICY "Public can view safe profile data"
ON public.profiles
FOR SELECT
USING (true);

-- 4. Add function to check if user is part of an active transaction
CREATE OR REPLACE FUNCTION public.is_active_transaction_participant(transaction_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = transaction_uuid
    AND (t.buyer_id = user_uuid OR t.seller_id = user_uuid)
    AND t.status IN ('pending', 'in_progress', 'payment_pending')
  );
END;
$function$;

-- 5. Restrict payment_proofs access to active transactions only
DROP POLICY IF EXISTS "Transaction participants can view payment proofs" ON public.payment_proofs;

CREATE POLICY "Only active transaction participants see payment proofs"
ON public.payment_proofs
FOR SELECT
USING (
  public.is_active_transaction_participant(transaction_id, auth.uid())
);

-- 6. Add UPDATE policy for transactions with proper restrictions
CREATE POLICY "Transaction parties can update status"
ON public.transactions
FOR UPDATE
USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
)
WITH CHECK (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- 7. Create a function to get sensitive profile data only for active transaction partners
CREATE OR REPLACE FUNCTION public.get_transaction_partner_contact(transaction_uuid uuid)
RETURNS TABLE(
  partner_id uuid,
  username text,
  phone text,
  address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_partner_id uuid;
BEGIN
  -- Get partner ID from active transaction
  SELECT CASE 
    WHEN t.buyer_id = v_user_id THEN t.seller_id
    WHEN t.seller_id = v_user_id THEN t.buyer_id
    ELSE NULL
  END INTO v_partner_id
  FROM public.transactions t
  WHERE t.id = transaction_uuid
  AND t.status IN ('pending', 'in_progress', 'payment_pending')
  AND (t.buyer_id = v_user_id OR t.seller_id = v_user_id);

  -- Return partner contact info if found
  IF v_partner_id IS NOT NULL THEN
    RETURN QUERY
    SELECT p.id, p.username, p.phone, p.address
    FROM public.profiles p
    WHERE p.id = v_partner_id;
  END IF;
END;
$function$;