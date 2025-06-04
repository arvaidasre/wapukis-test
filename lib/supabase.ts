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
  // Registracija su pataisytu timing'u
  async signUp(email: string, password: string, slapyvardis: string, ukioPavadinimas: string) {
    try {
      console.log("Starting signUp process...")

      // 1. Pirmiausia patikrinti ar vartotojas jau egzistuoja
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser?.user) {
        console.log("User already signed in, signing out first...")
        await supabase.auth.signOut()
      }

      // 2. Registruoti vartotoją
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
        } else {
          throw new Error(error.message || "Registracijos klaida")
        }
      }

      if (!data?.user) {
        throw new Error("Nepavyko sukurti vartotojo")
      }

      console.log("User created successfully:", data.user.id)

      // 3. Palaukti ilgiau, kad auth.users įrašas būtų pilnai sukurtas
      console.log("Waiting for auth user to be fully created...")
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 4. Patikrinti ar vartotojas egzistuoja auth.users lentelėje
      let authUserExists = false
      let retryCount = 0
      const maxRetries = 5

      while (!authUserExists && retryCount < maxRetries) {
        try {
          const { data: authUser, error: authError } = await supabase.auth.getUser()

          if (!authError && authUser?.user?.id === data.user.id) {
            authUserExists = true
            console.log("Auth user confirmed to exist")
          } else {
            console.log(`Auth user not found, retry ${retryCount + 1}/${maxRetries}`)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            retryCount++
          }
        } catch (checkError) {
          console.log("Error checking auth user:", checkError)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          retryCount++
        }
      }

      if (!authUserExists) {
        console.log("Auth user not confirmed, but continuing...")
      }

      // 5. Patikrinti ar profilis egzistuoja
      const { data: profileData, error: profileError } = await supabase
        .from("vartotojai")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profileData) {
        console.log("Profile not found, creating manually...")

        // Bandyti sukurti profilį su retry logika
        let profileCreated = false
        let profileRetryCount = 0
        const maxProfileRetries = 3

        while (!profileCreated && profileRetryCount < maxProfileRetries) {
          try {
            const { error: insertError } = await supabase.from("vartotojai").insert({
              id: data.user.id,
              el_pastas: email,
              slapyvardis: slapyvardis,
            })

            if (insertError) {
              if (insertError.message.includes("foreign key constraint")) {
                console.log(`Foreign key constraint error, retry ${profileRetryCount + 1}/${maxProfileRetries}`)
                await new Promise((resolve) => setTimeout(resolve, 2000))
                profileRetryCount++
              } else if (insertError.message.includes("duplicate key")) {
                console.log("Profile already exists (duplicate key)")
                profileCreated = true
              } else {
                throw insertError
              }
            } else {
              console.log("Profile created manually")
              profileCreated = true
            }
          } catch (retryError) {
            console.error(`Profile creation retry ${profileRetryCount + 1} failed:`, retryError)
            profileRetryCount++
            if (profileRetryCount >= maxProfileRetries) {
              console.log("Max profile creation retries reached, continuing without profile")
              break
            }
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        }
      } else {
        console.log("Profile already exists")
      }

      // 6. Prisijungti automatiškai
      console.log("Attempting auto sign-in...")
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Auto sign-in error:", signInError)
        // Tęsti be automatinio prisijungimo - vartotojas galės prisijungti rankiniu būdu
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
  // Pataisyta createUserProfile funkcija su geresniu timing'u
  async createUserProfile(userId: string, email: string, slapyvardis: string) {
    try {
      console.log("Creating user profile manually for user:", userId)

      // Pirmiausia patikrinti ar profilis jau egzistuoja
      const { data: existingProfile, error: checkError } = await supabase
        .from("vartotojai")
        .select("id")
        .eq("id", userId)
        .single()

      if (!checkError && existingProfile) {
        console.log("Profile already exists")
        return { data: existingProfile, error: null }
      }

      // Patikrinti ar vartotojas egzistuoja auth.users lentelėje
      console.log("Checking if auth user exists...")

      // Bandyti sukurti profilį su retry logika
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts) {
        try {
          const { data, error } = await supabase
            .from("vartotojai")
            .insert({
              id: userId,
              el_pastas: email,
              slapyvardis: slapyvardis,
            })
            .select()
            .single()

          if (error) {
            if (error.message.includes("foreign key constraint")) {
              attempts++
              console.log(`Foreign key constraint error, attempt ${attempts}/${maxAttempts}`)

              if (attempts >= maxAttempts) {
                throw new Error("Nepavyko sukurti profilio - vartotojas dar neegzistuoja sistemoje")
              }

              // Palaukti ir bandyti dar kartą
              await new Promise((resolve) => setTimeout(resolve, 2000))
              continue
            } else if (error.message.includes("duplicate key")) {
              console.log("Profile already exists (duplicate key)")
              // Gauti esamą profilį
              const { data: existing } = await supabase.from("vartotojai").select("*").eq("id", userId).single()
              return { data: existing, error: null }
            } else {
              throw error
            }
          }

          console.log("Profile created successfully:", data)
          return { data, error: null }
        } catch (attemptError) {
          attempts++
          if (attempts >= maxAttempts) {
            throw attemptError
          }
          console.log(`Profile creation attempt ${attempts} failed, retrying...`)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      throw new Error("Nepavyko sukurti profilio po kelių bandymų")
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
      const { data: existingFarms } = await supabase.from("ukiai").select("*").eq("vartotojo_id", vartotojoId)

      if (existingFarms && existingFarms.length > 0) {
        console.log("Farm already exists")
        return { data: existingFarms[0], error: null }
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
      console.log("Getting farm for user:", vartotojoId)

      // First check if any farm exists for this user
      const { data: farms, error: checkError } = await supabase
        .from("ukiai")
        .select("*")
        .eq("vartotojo_id", vartotojoId)

      if (checkError) {
        console.error("Database check farms error:", checkError)
        throw new Error(checkError.message || "Ūkio patikrinimo klaida")
      }

      // If no farms exist, return null without error
      if (!farms || farms.length === 0) {
        console.log("No farms found for user")
        return { data: null, error: null }
      }

      // If multiple farms exist (shouldn't happen but just in case), use the first one
      if (farms.length > 1) {
        console.warn("Multiple farms found for user, using the first one")
      }

      return { data: farms[0], error: null }
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

  // Eksportuoti supabase objektą
  supabase,
}
