"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/auth/password-strength"
import { useToast } from "@/components/ui/use-toast"
import { authFunctions, dbFunctions } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, Mail, Lock, User, Home } from "lucide-react"

export default function AuthPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("prisijungimas")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    slapyvardis: "",
    ukioPavadinimas: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  // Tikrinti ar vartotojas jau prisijungęs
  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      const { user } = await authFunctions.getCurrentUser()
      if (user) {
        router.push("/")
      }
    } catch (error) {
      // Vartotojas neprisijungęs, tęsti normaliai
    }
  }

  // Formos validacija
  const validateForm = (isSignUp = false) => {
    const newErrors: Record<string, string> = {}

    // El. pašto validacija
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "El. paštas yra privalomas"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Neteisingas el. pašto formatas"
    }

    // Slaptažodžio validacija
    if (!formData.password) {
      newErrors.password = "Slaptažodis yra privalomas"
    } else if (isSignUp && formData.password.length < 8) {
      newErrors.password = "Slaptažodis turi būti mažiausiai 8 simbolių"
    }

    if (isSignUp) {
      // Slaptažodžio patvirtinimo validacija
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Patvirtinkite slaptažodį"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Slaptažodžiai nesutampa"
      }

      // Slapyvardžio validacija
      if (!formData.slapyvardis) {
        newErrors.slapyvardis = "Slapyvardis yra privalomas"
      } else if (formData.slapyvardis.length < 3) {
        newErrors.slapyvardis = "Slapyvardis turi būti mažiausiai 3 simbolių"
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.slapyvardis)) {
        newErrors.slapyvardis = "Slapyvardis gali turėti tik raides, skaičius ir pabraukimus"
      }

      // Ūkio pavadinimo validacija
      if (!formData.ukioPavadinimas) {
        newErrors.ukioPavadinimas = "Ūkio pavadinimas yra privalomas"
      } else if (formData.ukioPavadinimas.length < 2) {
        newErrors.ukioPavadinimas = "Ūkio pavadinimas turi būti mažiausiai 2 simbolių"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Registracija
  const handleSignUp = async () => {
    if (!validateForm(true)) return

    setLoading(true)
    try {
      // Registruoti vartotoją
      const { data, error } = await authFunctions.signUp(
        formData.email,
        formData.password,
        formData.slapyvardis,
        formData.ukioPavadinimas,
      )

      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("Šis el. paštas jau užregistruotas")
        }
        throw error
      }

      if (data.user) {
        // Sukurti vartotojo profilį
        const { error: profileError } = await dbFunctions.createUserProfile(
          data.user.id,
          formData.email,
          formData.slapyvardis,
        )

        if (profileError) throw profileError

        // Sukurti ūkį
        const { data: ukisData, error: ukisError } = await dbFunctions.createFarm(
          data.user.id,
          formData.ukioPavadinimas,
        )

        if (ukisError) throw ukisError

        // Sukurti pradinius išteklius
        const { error: istekliaiError } = await dbFunctions.createInitialResources(ukisData.id)
        if (istekliaiError) throw istekliaiError

        // Sukurti pradinius pastatus
        const { error: pastataiError } = await dbFunctions.createInitialBuildings(ukisData.id)
        if (pastataiError) throw pastataiError

        toast({
          title: "Registracija sėkminga! 🎉",
          description: "Patikrinkite el. paštą ir patvirtinkite paskyrą, kad galėtumėte prisijungti.",
        })

        // Pereiti į prisijungimo skirtuką
        setActiveTab("prisijungimas")
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registracijos klaida",
        description: error.message || "Įvyko nežinoma klaida",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Prisijungimas
  const handleSignIn = async () => {
    if (!validateForm(false)) return

    setLoading(true)
    try {
      const { data, error } = await authFunctions.signIn(formData.email, formData.password)

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Neteisingas el. paštas arba slaptažodis")
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Patvirtinkite el. paštą prieš prisijungiant")
        }
        throw error
      }

      if (data.user) {
        // Atnaujinti paskutinį prisijungimą
        await dbFunctions.updateLastLogin(data.user.id)

        toast({
          title: "Prisijungimas sėkmingas! 🌾",
          description: "Sveiki sugrįžę į savo ūkį!",
        })

        router.push("/")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast({
        title: "Prisijungimo klaida",
        description: error.message || "Įvyko nežinoma klaida",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Slaptažodžio atkūrimas
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Klaida",
        description: "Įveskite el. pašto adresą",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      toast({
        title: "Klaida",
        description: "Neteisingas el. pašto formatas",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await authFunctions.resetPassword(resetEmail)

      if (error) throw error

      setResetSent(true)
      toast({
        title: "Slaptažodžio atkūrimas išsiųstas! 📧",
        description: "Patikrinkite el. paštą ir sekite instrukcijas",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti slaptažodžio atkūrimo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-green-800 flex items-center justify-center gap-2">
            🌾 Didysis Ūkis
          </CardTitle>
          <p className="text-green-600">Lietuviška ūkio simuliacija</p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="prisijungimas">Prisijungimas</TabsTrigger>
              <TabsTrigger value="registracija">Registracija</TabsTrigger>
              <TabsTrigger value="atkurimas">Atkūrimas</TabsTrigger>
            </TabsList>

            {/* Prisijungimas */}
            <TabsContent value="prisijungimas" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  El. paštas
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                  }}
                  placeholder="jusu@elpastas.lt"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Slaptažodis
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                    }}
                    placeholder="••••••••"
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button onClick={handleSignIn} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Jungiamasi...
                  </>
                ) : (
                  "Prisijungti"
                )}
              </Button>

              <div className="text-center">
                <Button variant="link" className="text-sm text-green-600" onClick={() => setActiveTab("atkurimas")}>
                  Pamiršote slaptažodį?
                </Button>
              </div>
            </TabsContent>

            {/* Registracija */}
            <TabsContent value="registracija" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  El. paštas
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                  }}
                  placeholder="jusu@elpastas.lt"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slapyvardis" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Slapyvardis
                </Label>
                <Input
                  id="slapyvardis"
                  value={formData.slapyvardis}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slapyvardis: e.target.value }))
                    if (errors.slapyvardis) setErrors((prev) => ({ ...prev, slapyvardis: "" }))
                  }}
                  placeholder="JūsųSlapyvardis"
                  className={errors.slapyvardis ? "border-red-500" : ""}
                />
                {errors.slapyvardis && <p className="text-sm text-red-500">{errors.slapyvardis}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ukio-pavadinimas" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Ūkio pavadinimas
                </Label>
                <Input
                  id="ukio-pavadinimas"
                  value={formData.ukioPavadinimas}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, ukioPavadinimas: e.target.value }))
                    if (errors.ukioPavadinimas) setErrors((prev) => ({ ...prev, ukioPavadinimas: "" }))
                  }}
                  placeholder="Mano Ūkis"
                  className={errors.ukioPavadinimas ? "border-red-500" : ""}
                />
                {errors.ukioPavadinimas && <p className="text-sm text-red-500">{errors.ukioPavadinimas}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Slaptažodis
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                    }}
                    placeholder="••••••••"
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              {formData.password && <PasswordStrength password={formData.password} />}

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Patvirtinti slaptažodį
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                    }}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button onClick={handleSignUp} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registruojamasi...
                  </>
                ) : (
                  "Registruotis"
                )}
              </Button>

              <Alert>
                <AlertDescription className="text-sm">
                  Registruodamiesi sutinkate su mūsų naudojimo sąlygomis ir privatumo politika. Po registracijos gausite
                  el. laišką su patvirtinimo nuoroda.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Slaptažodžio atkūrimas */}
            <TabsContent value="atkurimas" className="space-y-4">
              {!resetSent ? (
                <>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Slaptažodžio atkūrimas</h3>
                    <p className="text-sm text-gray-600">
                      Įveskite savo el. pašto adresą ir mes išsiųsime slaptažodžio atkūrimo nuorodą.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      El. paštas
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="jusu@elpastas.lt"
                    />
                  </div>

                  <Button onClick={handlePasswordReset} className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Siunčiama...
                      </>
                    ) : (
                      "Siųsti atkūrimo nuorodą"
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl">📧</div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">Nuoroda išsiųsta!</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Patikrinkite savo el. paštą <strong>{resetEmail}</strong> ir sekite instrukcijas slaptažodžio
                      atkūrimui.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResetSent(false)
                      setResetEmail("")
                    }}
                  >
                    Siųsti dar kartą
                  </Button>
                </div>
              )}

              <div className="text-center">
                <Button variant="link" className="text-sm text-green-600" onClick={() => setActiveTab("prisijungimas")}>
                  Grįžti į prisijungimą
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
