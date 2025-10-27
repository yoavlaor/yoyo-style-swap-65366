-- Drop triggers first
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS check_delivery_completion ON public.delivery_confirmations;

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS update_transaction_timestamp();
CREATE OR REPLACE FUNCTION update_transaction_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS auto_complete_transaction();
CREATE OR REPLACE FUNCTION auto_complete_transaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.seller_delivered = true AND NEW.buyer_received_ok = true THEN
    UPDATE public.transactions
    SET status = 'completed'
    WHERE id = NEW.transaction_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_transaction_timestamp();

CREATE TRIGGER check_delivery_completion
AFTER UPDATE ON public.delivery_confirmations
FOR EACH ROW
EXECUTE FUNCTION auto_complete_transaction();