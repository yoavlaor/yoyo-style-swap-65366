-- Update handle_new_user to reject duplicate usernames instead of auto-numbering
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_phone TEXT;
  v_address TEXT;
BEGIN
  -- Get username from metadata - use exactly what user entered
  v_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- Limit username length to 30 characters
  v_username := substring(v_username, 1, 30);
  
  -- Get other metadata
  v_full_name := substring(COALESCE(new.raw_user_meta_data->>'full_name', ''), 1, 100);
  v_phone := new.raw_user_meta_data->>'phone';
  v_address := new.raw_user_meta_data->>'address';
  
  -- Validate avatar_url is a URL or empty
  v_avatar_url := CASE 
    WHEN COALESCE(new.raw_user_meta_data->>'avatar_url', '') ~ '^https?://'
    THEN substring(new.raw_user_meta_data->>'avatar_url', 1, 500)
    ELSE ''
  END;
  
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    RAISE EXCEPTION 'שם המשתמש "%" כבר תפוס. אנא בחרו שם אחר.', v_username;
  END IF;
  
  -- Insert with the exact username
  INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, address)
  VALUES (new.id, v_username, v_full_name, v_avatar_url, v_phone, v_address);
  
  RETURN new;
END;
$function$;