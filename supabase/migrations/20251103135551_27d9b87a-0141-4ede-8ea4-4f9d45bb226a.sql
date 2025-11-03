-- Fix security issues by creating secure access patterns

-- 1. Drop ALL existing policies on profiles to start fresh
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Create a view for public profile information (non-sensitive data only)
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

ALTER VIEW public.public_profiles SET (security_barrier = true);
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 3. Create new restrictive policies for profiles
CREATE POLICY "view_own_profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "insert_own_profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Add function for active transaction participants
CREATE OR REPLACE FUNCTION public.is_active_transaction_participant(transaction_uuid uuid, user_uuid uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
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

-- 5. Update payment_proofs policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'payment_proofs' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.payment_proofs', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "view_payment_proofs_active_only"
ON public.payment_proofs FOR SELECT
USING (public.is_active_transaction_participant(transaction_id, auth.uid()));

CREATE POLICY "insert_payment_proofs"
ON public.payment_proofs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.transactions t
  WHERE t.id = transaction_id AND t.buyer_id = auth.uid()
));

-- 6. Add UPDATE policy for transactions
CREATE POLICY "update_transaction_status"
ON public.transactions FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 7. Helper function to get partner contact for active transactions
CREATE OR REPLACE FUNCTION public.get_transaction_partner_contact(transaction_uuid uuid)
RETURNS TABLE(partner_id uuid, username text, phone text, address text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_partner_id uuid;
BEGIN
  SELECT CASE 
    WHEN t.buyer_id = v_user_id THEN t.seller_id
    WHEN t.seller_id = v_user_id THEN t.buyer_id
  END INTO v_partner_id
  FROM public.transactions t
  WHERE t.id = transaction_uuid
  AND t.status IN ('pending', 'in_progress', 'payment_pending')
  AND (t.buyer_id = v_user_id OR t.seller_id = v_user_id);

  IF v_partner_id IS NOT NULL THEN
    RETURN QUERY
    SELECT p.id, p.username, p.phone, p.address
    FROM public.profiles p WHERE p.id = v_partner_id;
  END IF;
END;
$function$;