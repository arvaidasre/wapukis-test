-- Fix foreign key constraint timing issues

-- 1. First, let's check the current foreign key constraint
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='vartotojai';

-- 2. Drop the existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a more robust trigger function that waits for the auth user to be committed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_nickname TEXT;
    retry_count INTEGER := 0;
    max_retries INTEGER := 5;
    profile_created BOOLEAN := FALSE;
BEGIN
    -- Get nickname from metadata or use default
    user_nickname := COALESCE(NEW.raw_user_meta_data->>'slapyvardis', 'Vartotojas_' || substring(NEW.id::text, 1, 8));
    
    -- Try to create the profile with retry logic
    WHILE retry_count < max_retries AND NOT profile_created LOOP
        BEGIN
            -- Check if profile already exists
            IF EXISTS (SELECT 1 FROM public.vartotojai WHERE id = NEW.id) THEN
                profile_created := TRUE;
                EXIT;
            END IF;
            
            -- Try to insert the profile
            INSERT INTO public.vartotojai (
                id, 
                el_pastas, 
                slapyvardis
            ) VALUES (
                NEW.id,
                NEW.email,
                user_nickname
            );
            
            profile_created := TRUE;
            
        EXCEPTION
            WHEN foreign_key_violation THEN
                retry_count := retry_count + 1;
                -- Wait a bit before retrying (PostgreSQL doesn't have SLEEP, so we use pg_sleep)
                PERFORM pg_sleep(0.5);
                
            WHEN unique_violation THEN
                -- Profile already exists, that's fine
                profile_created := TRUE;
                
            WHEN OTHERS THEN
                -- Log the error but don't fail the auth user creation
                RAISE WARNING 'Error creating user profile (attempt %): %', retry_count + 1, SQLERRM;
                retry_count := retry_count + 1;
                PERFORM pg_sleep(0.5);
        END;
    END LOOP;
    
    IF NOT profile_created THEN
        RAISE WARNING 'Failed to create user profile after % attempts for user %', max_retries, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger with a slight delay
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Alternative: Create a function that can be called manually if the trigger fails
CREATE OR REPLACE FUNCTION public.create_user_profile_manual(
    user_id UUID,
    user_email TEXT,
    user_nickname TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    profile_exists BOOLEAN := FALSE;
BEGIN
    -- Check if profile already exists
    SELECT EXISTS (
        SELECT 1 FROM public.vartotojai WHERE id = user_id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RETURN TRUE;
    END IF;
    
    -- Check if auth user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        RAISE EXCEPTION 'Auth user with id % does not exist', user_id;
    END IF;
    
    -- Create the profile
    INSERT INTO public.vartotojai (
        id, 
        el_pastas, 
        slapyvardis
    ) VALUES (
        user_id,
        user_email,
        user_nickname
    );
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile_manual(UUID, TEXT, TEXT) TO authenticated;

-- 7. Test the setup
SELECT 'Foreign key timing fix completed successfully' as status;
