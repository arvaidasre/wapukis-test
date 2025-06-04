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

// Autentifikacijos funkcijos
export const authFunctions = {
  // Registracija su geresniu klaidų valdymu
  async signUp(email: string, password: string, slapyvardis: string, ukioPavadinimas: string) {
    try {
      console.log("Starting signUp process...")

      // 1. Pirmiausia patikrinti ar vartotojas jau egzistuoja
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser?.user) {
        console.log("User already signed in, signing out first...")
        await supabase.auth.signOut()
      }

      // 2. Registruoti vartotoją be automatinio trigger'io
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

      console.log("SignUp response:", { data, error })

      if (error) {
        console.error("Supabase signUp error:", error)

        // Specifinės klaidos
        if (error.message.includes("User already registered")) {
          throw new Error("Šis el. paštas jau užregistruotas")
        } else if (error.message.includes("Invalid email")) {
          throw new Error("Neteisingas el. pašto formatas")
        } else if (error.message.includes("Password")) {
          throw new Error("Slaptažodis neatitinka reikalavimų")
        } else if (error.message.includes("Database error")) {
          // Bandyti be trigger'io
          console.log("Database trigger error, trying manual profile creation...")
        } else {
          throw new Error(error.message || "Registracijos klaida")
        }
      }

      if (!data?.user) {
        throw new Error("Nepavyko sukurti vartotojo")
      }

      console.log("User created successfully:", data.user.id)

      // 3. Palaukti ir patikrinti ar profilis sukurtas
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 4. Patikrinti ar profilis egzistuoja, jei ne - sukurti rankiniu būdu
      const { data: profileData, error: profileError } = await supabase
        .from("vartotojai")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profileData) {
        console.log("Profile not found, creating manually...")

        // Sukurti profilį rankiniu būdu
        const { error: insertError } = await supabase.from("vartotojai").insert({
          id: data.user.id,
          el_pastas: email,
          slapyvardis: slapyvardis,
          el_pasto_patvirtintas: true,
        })

        if (insertError) {
          console.error("Manual profile creation error:", insertError)
          // Tęsti be profilio - bus sukurtas vėliau
        } else {
          console.log("Profile created manually")
        }
      } else {
        console.log("Profile exists")
      }

      // 5. Prisijungti automatiškai
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Auto sign-in error:", signInError)
        // Tęsti be automatinio prisijungimo
      } else {
        console.log("Auto sign-in successful")
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("SignUp function error:", error)
      return { data: null, error: error }
    }
  },

  // Prisijungimas
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase signIn error:", error)

        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Neteisingas el. paštas arba slaptažodis")
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Patvirtinkite el. paštą prieš prisijungiant")
        } else {
          throw new Error(error.message || "Prisijungimo klaida")
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("SignIn function error:", error)
      return { data: null, error: error }
    }
  },

  // Atsijungimas
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Supabase signOut error:", error)
        throw new Error(error.message || "Atsijungimo klaida")
      }
      return { error: null }
    } catch (error: any) {
      console.error("SignOut function error:", error)
      return { error: error }
    }
  },

  // Slaptažodžio atkūrimas
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("Supabase resetPassword error:", error)
        throw new Error(error.message || "Slaptažodžio atkūrimo klaida")
      }

      return { error: null }
    } catch (error: any) {
      console.error("ResetPassword function error:", error)
      return { error: error }
    }
  },

  // Slaptažodžio atnaujinimas
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error("Supabase updatePassword error:", error)
        throw new Error(error.message || "Slaptažodžio atnaujinimo klaida")
      }

      return { error: null }
    } catch (error: any) {
      console.error("UpdatePassword function error:", error)
      return { error: error }
    }
  },

  // Gauti dabartinį vartotoją
  async getCurrentUser() {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.log("Session error:", sessionError.message)
        return { user: null, error: null }
      }

      if (!sessionData?.session) {
        console.log("No active session found")
        return { user: null, error: null }
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.log("User fetch error:", error.message)
        return { user: null, error: null }
      }

      return { user, error: null }
    } catch (error: any) {
      console.log("GetCurrentUser function error:", error.message)
      return { user: null, error: null }
    }
  },

  // Patikrinti, ar yra aktyvi sesija
  async hasActiveSession() {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession()
      return !error && !!sessionData?.session
    } catch (error) {
      console.log("Session check error:", error)
      return false
    }
  },

  // Klausytis autentifikacijos pokyčių
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Duomenų bazės funkcijos su geresniu klaidų valdymu
export const dbFunctions = {
  // Sukurti vartotojo profilį rankiniu būdu
  async createUserProfile(userId: string, email: string, slapyvardis: string) {
    try {
      console.log("Creating user profile manually...")

      const { data, error } = await supabase
        .from("vartotojai")
        .insert({
          id: userId,
          el_pastas: email,
          slapyvardis: slapyvardis,
          el_pasto_patvirtintas: true,
        })
        .select()
        .single()

      if (error) {
        console.error("Manual profile creation error:", error)
        throw new Error(error.message || "Profilio sukūrimo klaida")
      }

      console.log("Profile created manually:", data)
      return { data, error: null }
    } catch (error: any) {
      console.error("CreateUserProfile function error:", error)
      return { data: null, error: error }
    }
  },

  // Sukurti ūkį
  async createFarm(vartotojoId: string, pavadinimas: string) {
    try {
      console.log("Creating farm for user:", vartotojoId)

      // Patikrinti ar ūkis jau egzistuoja
      const { data: existingFarm } = await supabase.from("ukiai").select("id").eq("vartotojo_id", vartotojoId).single()

      if (existingFarm) {
        console.log("Farm already exists")
        return { data: existingFarm, error: null }
      }

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

      if (error) {
        console.error("Database createFarm error:", error)
        throw new Error(error.message || "Ūkio sukūrimo klaida")
      }

      console.log("Farm created successfully:", data)
      return { data, error: null }
    } catch (error: any) {
      console.error("CreateFarm function error:", error)
      return { data: null, error: error }
    }
  },

  // Sukurti pradinius išteklius
  async createInitialResources(ukioId: string) {
    try {
      console.log("Creating initial resources for farm:", ukioId)

      // Patikrinti ar ištekliai jau egzistuoja
      const { data: existingResources } = await supabase.from("istekliai").select("id").eq("ukio_id", ukioId).limit(1)

      if (existingResources && existingResources.length > 0) {
        console.log("Resources already exist")
        return { data: existingResources, error: null }
      }

      const pradiniaiIstekliai = [
        { ukio_id: ukioId, tipas: "grudai", kiekis: 50 },
        { ukio_id: ukioId, tipas: "vaisiai", kiekis: 20 },
        { ukio_id: ukioId, tipas: "pienas", kiekis: 10 },
        { ukio_id: ukioId, tipas: "kiausiniai", kiekis: 15 },
        { ukio_id: ukioId, tipas: "mesa", kiekis: 5 },
      ]

      const { data, error } = await supabase.from("istekliai").insert(pradiniaiIstekliai).select()

      if (error) {
        console.error("Database createInitialResources error:", error)
        throw new Error(error.message || "Pradinių išteklių sukūrimo klaida")
      }

      console.log("Initial resources created successfully")
      return { data, error: null }
    } catch (error: any) {
      console.error("CreateInitialResources function error:", error)
      return { data: null, error: error }
    }
  },

  // Sukurti pradinius pastatus
  async createInitialBuildings(ukioId: string) {
    try {
      console.log("Creating initial buildings for farm:", ukioId)

      // Patikrinti ar pastatai jau egzistuoja
      const { data: existingBuildings } = await supabase.from("pastatai").select("id").eq("ukio_id", ukioId).limit(1)

      if (existingBuildings && existingBuildings.length > 0) {
        console.log("Buildings already exist")
        return { data: existingBuildings, error: null }
      }

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

      if (error) {
        console.error("Database createInitialBuildings error:", error)
        throw new Error(error.message || "Pradinių pastatų sukūrimo klaida")
      }

      console.log("Initial buildings created successfully")
      return { data, error: null }
    } catch (error: any) {
      console.error("CreateInitialBuildings function error:", error)
      return { data: null, error: error }
    }
  },

  // Gauti vartotojo ūkį
  async getUserFarm(vartotojoId: string) {
    try {
      const { data, error } = await supabase.from("ukiai").select("*").eq("vartotojo_id", vartotojoId).single()

      if (error) {
        console.error("Database getUserFarm error:", error)
        throw new Error(error.message || "Ūkio gavimo klaida")
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("GetUserFarm function error:", error)
      return { data: null, error: error }
    }
  },

  // Atnaujinti paskutinį prisijungimą
  async updateLastLogin(vartotojoId: string) {
    try {
      const { error } = await supabase
        .from("vartotojai")
        .update({ paskutinis_prisijungimas: new Date().toISOString() })
        .eq("id", vartotojoId)

      if (error) {
        console.error("Database updateLastLogin error:", error)
        throw new Error(error.message || "Paskutinio prisijungimo atnaujinimo klaida")
      }

      return { error: null }
    } catch (error: any) {
      console.error("UpdateLastLogin function error:", error)
      return { error: error }
    }
  },
}
