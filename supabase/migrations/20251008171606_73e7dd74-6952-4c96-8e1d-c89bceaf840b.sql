-- Add shipping_method column to transactions table
ALTER TABLE public.transactions
ADD COLUMN shipping_method text;