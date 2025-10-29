-- Update the handle_new_user function to use the exact username from signup
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
  v_counter INTEGER := 1;
  v_final_username TEXT;
BEGIN
  -- Get username from metadata - use exactly what user entered
  v_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- Limit username length to 30 characters
  v_username := substring(v_username, 1, 30);
  v_final_username := v_username;
  
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
  
  -- Try to insert with the exact username
  BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, address)
    VALUES (new.id, v_final_username, v_full_name, v_avatar_url, v_phone, v_address);
  EXCEPTION
    WHEN unique_violation THEN
      -- If username exists, try adding numbers (username2, username3, etc.)
      LOOP
        v_counter := v_counter + 1;
        v_final_username := substring(v_username || v_counter::text, 1, 30);
        
        BEGIN
          INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, address)
          VALUES (new.id, v_final_username, v_full_name, v_avatar_url, v_phone, v_address);
          EXIT; -- Successfully inserted, exit loop
        EXCEPTION
          WHEN unique_violation THEN
            -- Try next number
            CONTINUE;
        END;
        
        -- Safety check: don't loop forever
        IF v_counter > 100 THEN
          RAISE EXCEPTION 'Could not create unique username after 100 attempts';
        END IF;
      END LOOP;
  END;
  
  RETURN new;
END;
$function$;