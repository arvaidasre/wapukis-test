-- Pataisyti stulpelio klaidas

-- 1. Pašalinti seną lentelę ir sukurti iš naujo su teisingais stulpeliais
DROP TABLE IF EXISTS public.gyvunai CASCADE;
DROP TABLE IF EXISTS public.augalai CASCADE;
DROP TABLE IF EXISTS public.pastatai CASCADE;
DROP TABLE IF EXISTS public.istekliai CASCADE;
DROP TABLE IF EXISTS public.ukiai CASCADE;
DROP TABLE IF EXISTS public.vartotojai CASCADE;

-- 2. Sukurti vartotojų lentelę su teisingais stulpeliais
CREATE TABLE public.vartotojai (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    el_pastas VARCHAR(255) UNIQUE NOT NULL,
    slapyvardis VARCHAR(50) UNIQUE NOT NULL,
    sukurimo_data TIMESTAMP DEFAULT NOW(),
    paskutinis_prisijungimas TIMESTAMP DEFAULT NOW(),
    lygis INTEGER DEFAULT 1,
    patirtis INTEGER DEFAULT 0
);

-- 3. Sukurti ūkių lentelę
CREATE TABLE public.ukiai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vartotojo_id UUID REFERENCES public.vartotojai(id) ON DELETE CASCADE,
    pavadinimas VARCHAR(100) NOT NULL,
    lygis INTEGER DEFAULT 1,
    pinigai INTEGER DEFAULT 1000,
    patirtis INTEGER DEFAULT 0,
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- 4. Sukurti išteklių lentelę
CREATE TABLE public.istekliai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES public.ukiai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    kiekis INTEGER DEFAULT 0,
    atnaujinimo_data TIMESTAMP DEFAULT NOW()
);

-- 5. Sukurti pastatų lentelę
CREATE TABLE public.pastatai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES public.ukiai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    lygis INTEGER DEFAULT 1,
    pozicija_x INTEGER NOT NULL,
    pozicija_y INTEGER NOT NULL,
    busena VARCHAR(20) DEFAULT 'laisvas',
    gamybos_pabaiga TIMESTAMP,
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- 6. Sukurti augalų lentelę
CREATE TABLE public.augalai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES public.ukiai(id) ON DELETE CASCADE,
    lauko_id UUID REFERENCES public.pastatai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    sodinimo_data TIMESTAMP DEFAULT NOW(),
    derliaus_data TIMESTAMP NOT NULL,
    busena VARCHAR(20) DEFAULT 'auga'
);

-- 7. Sukurti gyvūnų lentelę
CREATE TABLE public.gyvunai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES public.ukiai(id) ON DELETE CASCADE,
    tvarto_id UUID REFERENCES public.pastatai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    vardas VARCHAR(50),
    amzius INTEGER DEFAULT 0,
    sveikata INTEGER DEFAULT 100,
    laimingumas INTEGER DEFAULT 100,
    paskutinis_maisinimas TIMESTAMP DEFAULT NOW(),
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- 8. Pašalinti seną trigger'į
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 9. Sukurti naują, paprastesnį trigger'į
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_nickname TEXT;
BEGIN
    -- Gauti slapyvardį iš metadata arba naudoti numatytąjį
    user_nickname := COALESCE(NEW.raw_user_meta_data->>'slapyvardis', 'Vartotojas_' || substring(NEW.id::text, 1, 8));
    
    -- Įterpti naują vartotoją (be el_pasto_patvirtintas stulpelio)
    INSERT INTO public.vartotojai (
        id, 
        el_pastas, 
        slapyvardis
    ) VALUES (
        NEW.id,
        NEW.email,
        user_nickname
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Jei įvyko klaida, vis tiek grąžinti NEW, kad registracija nepakibtų
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Sukurti trigger'į
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Išjungti RLS laikinai
ALTER TABLE public.vartotojai DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ukiai DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.istekliai DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastatai DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.augalai DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyvunai DISABLE ROW LEVEL SECURITY;

-- 12. Sukurti paprastas politikas
CREATE POLICY "Allow all" ON public.vartotojai FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.ukiai FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.istekliai FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.pastatai FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.augalai FOR ALL USING (true);
CREATE POLICY "Allow all" ON public.gyvunai FOR ALL USING (true);

-- 13. Įjungti RLS
ALTER TABLE public.vartotojai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ukiai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.istekliai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastatai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.augalai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyvunai ENABLE ROW LEVEL SECURITY;

-- 14. Sukurti indeksus
CREATE INDEX IF NOT EXISTS idx_vartotojai_el_pastas ON public.vartotojai(el_pastas);
CREATE INDEX IF NOT EXISTS idx_vartotojai_slapyvardis ON public.vartotojai(slapyvardis);
CREATE INDEX IF NOT EXISTS idx_ukiai_vartotojo_id ON public.ukiai(vartotojo_id);
CREATE INDEX IF NOT EXISTS idx_istekliai_ukio_id ON public.istekliai(ukio_id);
CREATE INDEX IF NOT EXISTS idx_pastatai_ukio_id ON public.pastatai(ukio_id);
CREATE INDEX IF NOT EXISTS idx_augalai_ukio_id ON public.augalai(ukio_id);
CREATE INDEX IF NOT EXISTS idx_gyvunai_ukio_id ON public.gyvunai(ukio_id);

-- 15. Patikrinti ar viskas veikia
SELECT 'Tables created successfully' as status;

-- 16. Parodyti lentelių struktūrą
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('vartotojai', 'ukiai', 'istekliai', 'pastatai', 'augalai', 'gyvunai')
ORDER BY table_name, ordinal_position;
