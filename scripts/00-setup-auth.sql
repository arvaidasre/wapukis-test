-- Pirma, sukurkime visas reikalingas lenteles ir nustatymus

-- 1. Išjungti el. pašto patvirtinimą
-- (Tai reikia padaryti Supabase Dashboard -> Authentication -> Settings)

-- 2. Sukurti vartotojų lentelę
CREATE TABLE IF NOT EXISTS public.vartotojai (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    el_pastas VARCHAR(255) UNIQUE NOT NULL,
    slapyvardis VARCHAR(50) UNIQUE NOT NULL,
    sukurimo_data TIMESTAMP DEFAULT NOW(),
    paskutinis_prisijungimas TIMESTAMP DEFAULT NOW(),
    lygis INTEGER DEFAULT 1,
    patirtis INTEGER DEFAULT 0,
    el_pasto_patvirtintas BOOLEAN DEFAULT TRUE
);

-- 3. Sukurti ūkių lentelę
CREATE TABLE IF NOT EXISTS public.ukiai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vartotojo_id UUID REFERENCES public.vartotojai(id) ON DELETE CASCADE,
    pavadinimas VARCHAR(100) NOT NULL,
    lygis INTEGER DEFAULT 1,
    pinigai INTEGER DEFAULT 1000,
    patirtis INTEGER DEFAULT 0,
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- 4. Sukurti išteklių lentelę
CREATE TABLE IF NOT EXISTS public.istekliai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES public.ukiai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    kiekis INTEGER DEFAULT 0,
    atnaujinimo_data TIMESTAMP DEFAULT NOW()
);

-- 5. Sukurti pastatų lentelę
CREATE TABLE IF NOT EXISTS public.pastatai (
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
CREATE TABLE IF NOT EXISTS public.augalai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES public.ukiai(id) ON DELETE CASCADE,
    lauko_id UUID REFERENCES public.pastatai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    sodinimo_data TIMESTAMP DEFAULT NOW(),
    derliaus_data TIMESTAMP NOT NULL,
    busena VARCHAR(20) DEFAULT 'auga'
);

-- 7. Sukurti gyvūnų lentelę
CREATE TABLE IF NOT EXISTS public.gyvunai (
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

-- 8. RLS (Row Level Security) politikos
ALTER TABLE public.vartotojai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ukiai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.istekliai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastatai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.augalai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyvunai ENABLE ROW LEVEL SECURITY;

-- 9. Politikos vartotojams
CREATE POLICY "Vartotojai gali matyti savo duomenis" ON public.vartotojai
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Vartotojai gali kurti savo profilį" ON public.vartotojai
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. Politikos ūkiams
CREATE POLICY "Vartotojai gali matyti savo ūkius" ON public.ukiai
    FOR ALL USING (vartotojo_id = auth.uid());

CREATE POLICY "Vartotojai gali kurti savo ūkius" ON public.ukiai
    FOR INSERT WITH CHECK (vartotojo_id = auth.uid());

-- 11. Politikos ištekliams
CREATE POLICY "Vartotojai gali matyti savo išteklius" ON public.istekliai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Vartotojai gali kurti savo išteklius" ON public.istekliai
    FOR INSERT WITH CHECK (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

-- 12. Politikos pastatams
CREATE POLICY "Vartotojai gali matyti savo pastatus" ON public.pastatai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Vartotojai gali kurti savo pastatus" ON public.pastatai
    FOR INSERT WITH CHECK (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

-- 13. Politikos augalams
CREATE POLICY "Vartotojai gali matyti savo augalus" ON public.augalai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Vartotojai gali kurti savo augalus" ON public.augalai
    FOR INSERT WITH CHECK (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

-- 14. Politikos gyvūnams
CREATE POLICY "Vartotojai gali matyti savo gyvūnus" ON public.gyvunai
    FOR ALL USING (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

CREATE POLICY "Vartotojai gali kurti savo gyvūnus" ON public.gyvunai
    FOR INSERT WITH CHECK (ukio_id IN (SELECT id FROM public.ukiai WHERE vartotojo_id = auth.uid()));

-- 15. Funkcija automatiniam profilio sukūrimui
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vartotojai (id, el_pastas, slapyvardis, el_pasto_patvirtintas)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'slapyvardis', 'Vartotojas'),
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Trigger'is automatiniam profilio sukūrimui
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. Indeksai našumui
CREATE INDEX IF NOT EXISTS idx_vartotojai_el_pastas ON public.vartotojai(el_pastas);
CREATE INDEX IF NOT EXISTS idx_vartotojai_slapyvardis ON public.vartotojai(slapyvardis);
CREATE INDEX IF NOT EXISTS idx_ukiai_vartotojo_id ON public.ukiai(vartotojo_id);
CREATE INDEX IF NOT EXISTS idx_istekliai_ukio_id ON public.istekliai(ukio_id);
CREATE INDEX IF NOT EXISTS idx_pastatai_ukio_id ON public.pastatai(ukio_id);
CREATE INDEX IF NOT EXISTS idx_augalai_ukio_id ON public.augalai(ukio_id);
CREATE INDEX IF NOT EXISTS idx_gyvunai_ukio_id ON public.gyvunai(ukio_id);
