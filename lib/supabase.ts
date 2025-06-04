import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Duomenų bazės tipai
export interface Vartotojas {
  id: string
  el_pastas: string
  slapyvardis: string
  sukurimo_data: string
  paskutinis_prisijungimas: string
  lygis: number
  patirtis: number
}

export interface Ukis {
  id: string
  vartotojo_id: string
  pavadinimas: string
  lygis: number
  pinigai: number
  patirtis: number
  sukurimo_data: string
}

export interface Isteklius {
  id: string
  ukio_id: string
  tipas: string
  kiekis: number
  atnaujinimo_data: string
}

export interface Pastatas {
  id: string
  ukio_id: string
  tipas: string
  lygis: number
  pozicija_x: number
  pozicija_y: number
  busena: string
  gamybos_pabaiga?: string
  sukurimo_data: string
}

export interface Augalas {
  id: string
  ukio_id: string
  lauko_id: string
  tipas: string
  sodinimo_data: string
  derliaus_data: string
  busena: string
}

export interface Gyvunas {
  id: string
  ukio_id: string
  tvarto_id: string
  tipas: string
  vardas?: string
  amzius: number
  sveikata: number
  laimingumas: number
  paskutinis_maisinimas: string
  sukurimo_data: string
}

// Pridėti autentifikacijos funkcijas ir tipų atnaujinimus

// Pridėti po esamų tipų:
export interface AuthUser {
  id: string
  email: string
  slapyvardis: string
  sukurimo_data: string
  paskutinis_prisijungimas: string
  el_pasto_patvirtintas: boolean
}

// Pridėti autentifikacijos funkcijas:
export const authFunctions = {
  // Registracija
  async signUp(email: string, password: string, slapyvardis: string, ukioPavadinimas: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          slapyvardis,
          ukio_pavadinimas: ukioPavadinimas,
        },
      },
    })
    return { data, error }
  },

  // Prisijungimas
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Atsijungimas
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Slaptažodžio atkūrimas
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  },

  // Slaptažodžio atnaujinimas
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  },

  // Gauti dabartinį vartotoją
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  },

  // Klausytis autentifikacijos pokyčių
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Duomenų bazės funkcijos
export const dbFunctions = {
  // Sukurti vartotojo profilį
  async createUserProfile(userId: string, email: string, slapyvardis: string) {
    const { data, error } = await supabase
      .from("vartotojai")
      .insert([
        {
          id: userId,
          el_pastas: email,
          slapyvardis,
          el_pasto_patvirtintas: false,
        },
      ])
      .select()
      .single()

    return { data, error }
  },

  // Sukurti ūkį
  async createFarm(vartotojoId: string, pavadinimas: string) {
    const { data, error } = await supabase
      .from("ukiai")
      .insert([
        {
          vartotojo_id: vartotojoId,
          pavadinimas,
        },
      ])
      .select()
      .single()

    return { data, error }
  },

  // Sukurti pradinius išteklius
  async createInitialResources(ukioId: string) {
    const pradiniaiIstekliai = [
      { ukio_id: ukioId, tipas: "grudai", kiekis: 50 },
      { ukio_id: ukioId, tipas: "vaisiai", kiekis: 20 },
      { ukio_id: ukioId, tipas: "pienas", kiekis: 10 },
      { ukio_id: ukioId, tipas: "kiausiniai", kiekis: 15 },
      { ukio_id: ukioId, tipas: "mesa", kiekis: 5 },
    ]

    const { data, error } = await supabase.from("istekliai").insert(pradiniaiIstekliai).select()

    return { data, error }
  },

  // Sukurti pradinius pastatus
  async createInitialBuildings(ukioId: string) {
    const pradiniaiPastatai = [
      {
        ukio_id: ukioId,
        tipas: "laukas",
        lygis: 1,
        pozicija_x: 0,
        pozicija_y: 0,
        busena: "laisvas",
      },
      {
        ukio_id: ukioId,
        tipas: "tvartas",
        lygis: 1,
        pozicija_x: 1,
        pozicija_y: 0,
        busena: "laisvas",
      },
    ]

    const { data, error } = await supabase.from("pastatai").insert(pradiniaiPastatai).select()

    return { data, error }
  },

  // Gauti vartotojo ūkį
  async getUserFarm(vartotojoId: string) {
    const { data, error } = await supabase.from("ukiai").select("*").eq("vartotojo_id", vartotojoId).single()

    return { data, error }
  },

  // Atnaujinti paskutinį prisijungimą
  async updateLastLogin(vartotojoId: string) {
    const { error } = await supabase
      .from("vartotojai")
      .update({ paskutinis_prisijungimas: new Date().toISOString() })
      .eq("id", vartotojoId)

    return { error }
  },
}
