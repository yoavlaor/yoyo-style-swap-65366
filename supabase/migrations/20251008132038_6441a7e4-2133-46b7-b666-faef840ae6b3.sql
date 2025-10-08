-- Add shipping_method column to items table
ALTER TABLE public.items 
ADD COLUMN shipping_method text;

-- Add a check constraint for valid shipping methods
ALTER TABLE public.items
ADD CONSTRAINT valid_shipping_method 
CHECK (shipping_method IN ('pickup', 'delivery', 'both') OR shipping_method IS NULL);