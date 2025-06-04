-- Pakeisti vartotojų lentelės sukūrimą:
CREATE TABLE IF NOT EXISTS vartotojai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    el_pastas VARCHAR(255) UNIQUE NOT NULL,
    slapyvardis VARCHAR(50) UNIQUE NOT NULL,
    sukurimo_data TIMESTAMP DEFAULT NOW(),
    paskutinis_prisijungimas TIMESTAMP DEFAULT NOW(),
    lygis INTEGER DEFAULT 1,
    patirtis INTEGER DEFAULT 0,
    el_pasto_patvirtintas BOOLEAN DEFAULT FALSE
);

-- Pridėti indeksus našumui
CREATE INDEX IF NOT EXISTS idx_vartotojai_el_pastas ON vartotojai(el_pastas);
CREATE INDEX IF NOT EXISTS idx_vartotojai_slapyvardis ON vartotojai(slapyvardis);
CREATE INDEX IF NOT EXISTS idx_ukiai_vartotojo_id ON ukiai(vartotojo_id);
