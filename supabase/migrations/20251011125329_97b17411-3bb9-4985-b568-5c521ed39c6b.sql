-- Create seller_ratings table
CREATE TABLE public.seller_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, seller_id)
);

-- Enable RLS
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_ratings
CREATE POLICY "Anyone can view ratings"
ON public.seller_ratings
FOR SELECT
USING (true);

CREATE POLICY "Users can create ratings"
ON public.seller_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id AND user_id != seller_id);

CREATE POLICY "Users can update their own ratings"
ON public.seller_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.seller_ratings
FOR DELETE
USING (auth.uid() = user_id);

-- Add rating columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN total_ratings INTEGER DEFAULT 0;

-- Function to update seller rating
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller_id UUID;
  v_avg_rating NUMERIC;
  v_total_ratings INTEGER;
BEGIN
  -- Determine seller_id based on operation
  IF TG_OP = 'DELETE' THEN
    v_seller_id := OLD.seller_id;
  ELSE
    v_seller_id := NEW.seller_id;
  END IF;

  -- Calculate new average and total
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_ratings
  FROM public.seller_ratings
  WHERE seller_id = v_seller_id;

  -- Update profiles table
  UPDATE public.profiles
  SET 
    average_rating = v_avg_rating,
    total_ratings = v_total_ratings
  WHERE id = v_seller_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for automatic rating updates
CREATE TRIGGER update_seller_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.seller_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();