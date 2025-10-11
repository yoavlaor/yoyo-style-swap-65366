-- Add body measurements and verification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS body_type text,
ADD COLUMN IF NOT EXISTS chest_size numeric,
ADD COLUMN IF NOT EXISTS waist_size numeric,
ADD COLUMN IF NOT EXISTS hip_size numeric,
ADD COLUMN IF NOT EXISTS is_face_verified boolean DEFAULT false;