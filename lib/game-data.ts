// Žaidimo duomenų konfigūracija

export const AUGALU_TIPAI = {
  kvieciai: {
    pavadinimas: "Kviečiai",
    augimo_laikas: 30, // sekundės
    kaina: 10,
    pardavimo_kaina: 15,
    patirtis: 5,
    ikona: "🌾",
  },
  kukuruzai: {
    pavadinimas: "Kukurūzai",
    augimo_laikas: 60,
    kaina: 20,
    pardavimo_kaina: 35,
    patirtis: 10,
    ikona: "🌽",
  },
  pomidorai: {
    pavadinimas: "Pomidorai",
    augimo_laikas: 45,
    kaina: 15,
    pardavimo_kaina: 25,
    patirtis: 8,
    ikona: "🍅",
  },
  morka: {
    pavadinimas: "Morkos",
    augimo_laikas: 25,
    kaina: 8,
    pardavimo_kaina: 12,
    patirtis: 4,
    ikona: "🥕",
  },
}

export const GYVUNU_TIPAI = {
  karve: {
    pavadinimas: "Karvė",
    kaina: 500,
    maisinimo_intervalas: 120, // sekundės
    produktas: "pienas",
    produkto_kiekis: 3,
    patirtis: 15,
    ikona: "🐄",
  },
  vista: {
    pavadinimas: "Višta",
    kaina: 100,
    maisinimo_intervalas: 60,
    produktas: "kiausiniai",
    produkto_kiekis: 2,
    patirtis: 8,
    ikona: "🐔",
  },
  kiaule: {
    pavadinimas: "Kiaulė",
    kaina: 300,
    maisinimo_intervalas: 180,
    produktas: "mesa",
    produkto_kiekis: 2,
    patirtis: 12,
    ikona: "🐷",
  },
}

export const PASTATU_TIPAI = {
  laukas: {
    pavadinimas: "Laukas",
    kaina: 200,
    atnaujinimo_kaina: (lygis: number) => lygis * 300,
    ikona: "🌱",
  },
  tvartas: {
    pavadinimas: "Tvartas",
    kaina: 800,
    atnaujinimo_kaina: (lygis: number) => lygis * 500,
    talpa: (lygis: number) => lygis * 2,
    ikona: "🏚️",
  },
  namas: {
    pavadinimas: "Namas",
    kaina: 1000,
    atnaujinimo_kaina: (lygis: number) => lygis * 800,
    ikona: "🏠",
  },
  sandelis: {
    pavadinimas: "Sandėlis",
    kaina: 600,
    atnaujinimo_kaina: (lygis: number) => lygis * 400,
    talpa: (lygis: number) => lygis * 100,
    ikona: "🏪",
  },
}

export const RINKOS_KAINOS = {
  grudai: { pirkimo: 5, pardavimo: 3 },
  vaisiai: { pirkimo: 8, pardavimo: 6 },
  pienas: { pirkimo: 12, pardavimo: 10 },
  kiausiniai: { pirkimo: 10, pardavimo: 8 },
  mesa: { pirkimo: 25, pardavimo: 20 },
}
