-- Vartotojų lentelė
CREATE TABLE IF NOT EXISTS vartotojai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    el_pastas VARCHAR(255) UNIQUE NOT NULL,
    slapyvardis VARCHAR(50) UNIQUE NOT NULL,
    sukurimo_data TIMESTAMP DEFAULT NOW(),
    paskutinis_prisijungimas TIMESTAMP DEFAULT NOW(),
    lygis INTEGER DEFAULT 1,
    patirtis INTEGER DEFAULT 0
);

-- Ūkių lentelė
CREATE TABLE IF NOT EXISTS ukiai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vartotojo_id UUID REFERENCES vartotojai(id) ON DELETE CASCADE,
    pavadinimas VARCHAR(100) NOT NULL,
    lygis INTEGER DEFAULT 1,
    pinigai INTEGER DEFAULT 1000,
    patirtis INTEGER DEFAULT 0,
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- Išteklių lentelė
CREATE TABLE IF NOT EXISTS istekliai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    kiekis INTEGER DEFAULT 0,
    atnaujinimo_data TIMESTAMP DEFAULT NOW()
);

-- Pastatų lentelė
CREATE TABLE IF NOT EXISTS pastatai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    lygis INTEGER DEFAULT 1,
    pozicija_x INTEGER NOT NULL,
    pozicija_y INTEGER NOT NULL,
    busena VARCHAR(20) DEFAULT 'laisvas',
    gamybos_pabaiga TIMESTAMP,
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- Augalų lentelė
CREATE TABLE IF NOT EXISTS augalai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    lauko_id UUID REFERENCES pastatai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    sodinimo_data TIMESTAMP DEFAULT NOW(),
    derliaus_data TIMESTAMP NOT NULL,
    busena VARCHAR(20) DEFAULT 'auga'
);

-- Gyvūnų lentelė
CREATE TABLE IF NOT EXISTS gyvunai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    tvarto_id UUID REFERENCES pastatai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    vardas VARCHAR(50),
    amzius INTEGER DEFAULT 0,
    sveikata INTEGER DEFAULT 100,
    laimingumas INTEGER DEFAULT 100,
    paskutinis_maisinimas TIMESTAMP DEFAULT NOW(),
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- Prekybos lentelė
CREATE TABLE IF NOT EXISTS prekyba (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pardavejo_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    pirkejo_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    preke VARCHAR(50) NOT NULL,
    kiekis INTEGER NOT NULL,
    kaina INTEGER NOT NULL,
    busena VARCHAR(20) DEFAULT 'laukiama',
    sukurimo_data TIMESTAMP DEFAULT NOW(),
    uzdarymo_data TIMESTAMP
);

-- Kaimynų lentelė
CREATE TABLE IF NOT EXISTS kaimynai (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    kaimyno_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    busena VARCHAR(20) DEFAULT 'laukiama',
    sukurimo_data TIMESTAMP DEFAULT NOW()
);

-- Užduočių lentelė
CREATE TABLE IF NOT EXISTS uzduotys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ukio_id UUID REFERENCES ukiai(id) ON DELETE CASCADE,
    tipas VARCHAR(50) NOT NULL,
    aprasymas TEXT NOT NULL,
    tikslas INTEGER NOT NULL,
    dabartinis_progresas INTEGER DEFAULT 0,
    apdovanojimas_pinigai INTEGER DEFAULT 0,
    apdovanojimas_patirtis INTEGER DEFAULT 0,
    busena VARCHAR(20) DEFAULT 'aktyvi',
    sukurimo_data TIMESTAMP DEFAULT NOW(),
    uzdarymo_data TIMESTAMP
);
