-- Įterpti pradinius duomenis

-- Išteklių tipai
INSERT INTO istekliai (ukio_id, tipas, kiekis) 
SELECT id, 'grudai', 50 FROM ukiai;

INSERT INTO istekliai (ukio_id, tipas, kiekis) 
SELECT id, 'vaisiai', 20 FROM ukiai;

INSERT INTO istekliai (ukio_id, tipas, kiekis) 
SELECT id, 'pienas', 10 FROM ukiai;

INSERT INTO istekliai (ukio_id, tipas, kiekis) 
SELECT id, 'kiausiniai', 15 FROM ukiai;

INSERT INTO istekliai (ukio_id, tipas, kiekis) 
SELECT id, 'mesa', 5 FROM ukiai;

-- Pradinės užduotys
INSERT INTO uzduotys (ukio_id, tipas, aprasymas, tikslas, apdovanojimas_pinigai, apdovanojimas_patirtis)
SELECT id, 'sodinimas', 'Pasodinkite 5 kviečių laukus', 5, 100, 50 FROM ukiai;

INSERT INTO uzduotys (ukio_id, tipas, aprasymas, tikslas, apdovanojimas_pinigai, apdovanojimas_patirtis)
SELECT id, 'gyvunai', 'Nupirkite 3 karves', 3, 200, 75 FROM ukiai;
