-- Add YOYO user as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('40342673-b941-4e07-b3e8-39d5dade48ea', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;