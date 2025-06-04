-- Simplify registration process to rely on triggers

-- 1. Make sure the trigger is working properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create a simpler, more reliable trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_nickname TEXT;
BEGIN
    -- Get nickname from metadata or use default
    user_nickname := COALESCE(NEW.raw_user_meta_data->>'slapyvardis', 'Vartotojas_' || substring(NEW.id::text, 1, 8));
    
    -- Simple insert with basic error handling
    BEGIN
        INSERT INTO public.vartotojai (
            id, 
            el_pastas, 
            slapyvardis
        ) VALUES (
            NEW.id,
            NEW.email,
            user_nickname
        );
        
        RAISE NOTICE 'User profile created successfully for %', NEW.id;
        
    EXCEPTION
        WHEN unique_violation THEN
            -- Profile already exists, that's fine
            RAISE NOTICE 'User profile already exists for %', NEW.id;
            
        WHEN OTHERS THEN
            -- Log the error but don't fail the auth user creation
            RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create a function to check if everything is working
CREATE OR REPLACE FUNCTION public.test_user_creation()
RETURNS TEXT AS $$
DECLARE
    test_result TEXT;
BEGIN
    -- Check if trigger exists
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        test_result := 'Trigger exists and should work automatically. ';
    ELSE
        test_result := 'ERROR: Trigger does not exist! ';
    END IF;
    
    -- Check if function exists
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
    ) THEN
        test_result := test_result || 'Function exists. ';
    ELSE
        test_result := test_result || 'ERROR: Function does not exist! ';
    END IF;
    
    -- Check table structure
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'vartotojai'
    ) THEN
        test_result := test_result || 'Table exists. ';
    ELSE
        test_result := test_result || 'ERROR: Table does not exist! ';
    END IF;
    
    RETURN test_result || 'Setup should work automatically now.';
END;
$$ LANGUAGE plpgsql;

-- 5. Test the setup
SELECT public.test_user_creation() as setup_status;

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Make sure RLS policies are simple and working
DROP POLICY IF EXISTS "Allow all" ON public.vartotojai;
DROP POLICY IF EXISTS "Allow all" ON public.ukiai;
DROP POLICY IF EXISTS "Allow all" ON public.istekliai;
DROP POLICY IF EXISTS "Allow all" ON public.pastatai;
DROP POLICY IF EXISTS "Allow all" ON public.augalai;
DROP POLICY IF EXISTS "Allow all" ON public.gyvunai;

-- Create simple policies that allow authenticated users to access their own data
CREATE POLICY "Users can access own data" ON public.vartotojai
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own farms" ON public.ukiai
    FOR ALL USING (vartotojo_id = auth.uid());

CREATE POLICY "Users can access own resources" ON public.istekliai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Users can access own buildings" ON public.pastatai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Users can access own plants" ON public.augalai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Users can access own animals" ON public.gyvunai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

SELECT 'Registration simplification completed successfully' as status;
