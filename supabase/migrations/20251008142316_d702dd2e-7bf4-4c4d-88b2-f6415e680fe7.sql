-- First drop the existing column with RLS policies
ALTER TABLE items DROP COLUMN shipping_method;

-- Add it back as text array
ALTER TABLE items ADD COLUMN shipping_method text[] DEFAULT ARRAY[]::text[];