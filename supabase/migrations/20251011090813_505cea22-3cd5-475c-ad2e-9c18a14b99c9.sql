-- Add gender field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender text;

-- Remove specific body measurements columns
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS chest_size,
DROP COLUMN IF EXISTS waist_size,
DROP COLUMN IF EXISTS hip_size;