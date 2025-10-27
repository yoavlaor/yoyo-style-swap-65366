-- Update transactions table with new fields for payment flow
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS price_agreed numeric,
ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('bit', 'paybox', 'cash')),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update status column to support new payment flow statuses
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('started', 'pending', 'waiting_for_payment_proof', 'waiting_seller_confirmation', 'meeting_scheduled', 'ready_to_deliver', 'delivered_unconfirmed', 'completed', 'payment_disputed'));

-- Create payment_proofs table
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  method text NOT NULL CHECK (method IN ('bit', 'paybox', 'cash')),
  amount_reported_by_buyer numeric NOT NULL,
  seller_payment_target text NOT NULL,
  screenshot_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create delivery_confirmations table
CREATE TABLE IF NOT EXISTS public.delivery_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  seller_delivered boolean DEFAULT false,
  buyer_received_ok boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(transaction_id)
);

-- Create transaction_ratings table (separate from seller_ratings for transaction-specific feedback)
CREATE TABLE IF NOT EXISTS public.transaction_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(transaction_id, from_user_id)
);

-- Add payment preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bit_number text,
ADD COLUMN IF NOT EXISTS paybox_handle text;

-- Enable RLS on new tables
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_proofs
CREATE POLICY "Transaction participants can view payment proofs"
ON public.payment_proofs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = payment_proofs.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

CREATE POLICY "Buyers can create payment proofs"
ON public.payment_proofs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = payment_proofs.transaction_id
    AND t.buyer_id = auth.uid()
  )
);

-- RLS Policies for delivery_confirmations
CREATE POLICY "Transaction participants can view delivery confirmations"
ON public.delivery_confirmations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = delivery_confirmations.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

CREATE POLICY "Transaction participants can update delivery confirmations"
ON public.delivery_confirmations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = delivery_confirmations.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

CREATE POLICY "Transaction participants can create delivery confirmations"
ON public.delivery_confirmations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = delivery_confirmations.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

-- RLS Policies for transaction_ratings
CREATE POLICY "Anyone can view ratings"
ON public.transaction_ratings FOR SELECT
USING (true);

CREATE POLICY "Transaction participants can create ratings"
ON public.transaction_ratings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = transaction_ratings.transaction_id
    AND auth.uid() = from_user_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    AND from_user_id != to_user_id
  )
);

-- Trigger to auto-update transactions.updated_at
CREATE OR REPLACE FUNCTION update_transaction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_transaction_timestamp();

-- Trigger to auto-complete transaction when both delivery confirmations are true
CREATE OR REPLACE FUNCTION auto_complete_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.seller_delivered = true AND NEW.buyer_received_ok = true THEN
    UPDATE public.transactions
    SET status = 'completed'
    WHERE id = NEW.transaction_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_delivery_completion
AFTER UPDATE ON public.delivery_confirmations
FOR EACH ROW
EXECUTE FUNCTION auto_complete_transaction();