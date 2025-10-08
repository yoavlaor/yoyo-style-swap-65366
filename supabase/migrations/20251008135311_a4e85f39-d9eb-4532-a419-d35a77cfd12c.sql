-- Add gender column to items table
ALTER TABLE public.items 
ADD COLUMN gender text CHECK (gender IN ('women', 'men', 'unisex'));