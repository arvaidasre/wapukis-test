-- Fix the el_pasto_patvirtintas column issue

-- First, check if the column exists
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vartotojai'
        AND column_name = 'el_pasto_patvirtintas'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.vartotojai 
        ADD COLUMN el_pasto_patvirtintas BOOLEAN DEFAULT TRUE;
        
        RAISE NOTICE 'Added el_pasto_patvirtintas column to vartotojai table';
    ELSE
        RAISE NOTICE 'el_pasto_patvirtintas column already exists';
    END IF;
END $$;

-- Update the createUserProfile function to not use el_pasto_patvirtintas if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_nickname TEXT;
    column_exists BOOLEAN;
BEGIN
    -- Check if the column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vartotojai'
        AND column_name = 'el_pasto_patvirtintas'
    ) INTO column_exists;
    
    -- Get nickname from metadata or use default
    user_nickname := COALESCE(NEW.raw_user_meta_data->>'slapyvardis', 'Vartotojas_' || substring(NEW.id::text, 1, 8));
    
    -- Insert new user with or without el_pasto_patvirtintas
    IF column_exists THEN
        INSERT INTO public.vartotojai (
            id, 
            el_pastas, 
            slapyvardis, 
            el_pasto_patvirtintas
        ) VALUES (
            NEW.id,
            NEW.email,
            user_nickname,
            TRUE
        );
    ELSE
        INSERT INTO public.vartotojai (
            id, 
            el_pastas, 
            slapyvardis
        ) VALUES (
            NEW.id,
            NEW.email,
            user_nickname
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If an error occurred, still return NEW to allow registration
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the structure of the vartotojai table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'vartotojai'
ORDER BY 
    ordinal_position;
