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
import { Loader2, Eye, EyeOff, Mail, Lock, User, Home, CheckCircle } from "lucide-react"
import Image from "next/image"

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

  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      const hasSession = await authFunctions.hasActiveSession()
      if (!hasSession) {
        console.log("No existing auth session")
        return
      }

      const { user } = await authFunctions.getCurrentUser()
      if (user) {
        router.push("/")
      }
    } catch (error) {
      console.log("No existing auth session or error:", error)
    }
  }

  const validateForm = (isSignUp = false) => {
    const newErrors: Record<string, string> = {}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "El. paštas yra privalomas"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Neteisingas el. pašto formatas"
    }

    if (!formData.password) {
      newErrors.password = "Slaptažodis yra privalomas"
    } else if (isSignUp && formData.password.length < 6) {
      newErrors.password = "Slaptažodis turi būti mažiausiai 6 simbolių"
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Patvirtinkite slaptažodį"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Slaptažodžiai nesutampa"
      }

      if (!formData.slapyvardis) {
        newErrors.slapyvardis = "Slapyvardis yra privalomas"
      } else if (formData.slapyvardis.length < 3) {
        newErrors.slapyvardis = "Slapyvardis turi būti mažiausiai 3 simbolių"
      }

      if (!formData.ukioPavadinimas) {
        newErrors.ukioPavadinimas = "Ūkio pavadinimas yra privalomas"
      } else if (formData.ukioPavadinimas.length < 2) {
        newErrors.ukioPavadinimas = "Ūkio pavadinimas turi būti mažiausiai 2 simbolių"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async () => {
    console.log("Starting simplified registration process...")

    if (!validateForm(true)) {
      console.log("Form validation failed")
      return
    }

    setLoading(true)
    try {
      console.log("Attempting to register user with email:", formData.email)

      const result = await authFunctions.signUp(
        formData.email,
        formData.password,
        formData.slapyvardis,
        formData.ukioPavadinimas,
      )

      console.log("SignUp result:", result)

      if (result.error) {
        throw result.error
      }

      if (!result.data?.user) {
        throw new Error("Nepavyko sukurti vartotojo")
      }

      if (!result.needsConfirmation && result.data.user) {
        console.log("User is signed in, initializing game...")

        const gameInit = await dbFunctions.initializeUserGame(
          result.data.user.id,
          formData.email,
          formData.slapyvardis,
          formData.ukioPavadinimas,
        )

        if (!gameInit.success) {
          console.log("Game initialization failed, but user is created:", gameInit.error)
        }

        toast({
          title: "Registracija sėkminga! 🎉",
          description: "Jūsų paskyra sukurta ir galite iš karto pradėti žaisti!",
        })

        router.push("/")
      } else {
        toast({
          title: "Registracija sėkminga! 📧",
          description: result.message || "Prisijunkite su savo duomenimis.",
        })

        setActiveTab("prisijungimas")
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

  const handleSignIn = async () => {
    console.log("Starting sign in process...")

    if (!validateForm(false)) {
      console.log("Form validation failed")
      return
    }

    setLoading(true)
    try {
      console.log("Attempting to sign in user with email:", formData.email)

      const { data, error } = await authFunctions.signIn(formData.email, formData.password)

      console.log("SignIn response:", { data, error })

      if (error) {
        throw error
      }

      if (data?.user) {
        console.log("Sign in successful")

        try {
          await dbFunctions.updateLastLogin(data.user.id)
        } catch (updateError) {
          console.log("Last login update error:", updateError)
        }

        const { data: farm } = await dbFunctions.getUserFarm(data.user.id)

        if (!farm) {
          console.log("No farm found, initializing game structure...")

          const gameInit = await dbFunctions.initializeUserGame(
            data.user.id,
            formData.email,
            data.user.user_metadata?.slapyvardis || "Ūkininkas",
            data.user.user_metadata?.ukio_pavadinimas || "Mano ūkis",
          )

          if (gameInit.success) {
            toast({
              title: "Prisijungimas sėkmingas! 🌾",
              description: "Jūsų ūkis paruoštas žaidimui!",
            })
          } else {
            toast({
              title: "Prisijungimas sėkmingas! 🌾",
              description: "Sveiki sugrįžę! Ūkis bus paruoštas automatiškai.",
            })
          }
        } else {
          toast({
            title: "Prisijungimas sėkmingas! 🌾",
            description: "Sveiki sugrįžę į savo ūkį!",
          })
        }

        router.push("/")
      } else {
        throw new Error("Nepavyko prisijungti")
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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <Image
        src="/placeholder.svg?height=1080&width=1920"
        alt="Linksmas ūkio peizažas"
        layout="fill"
        objectFit="cover"
        quality={90}
        className="-z-10"
        priority
      />
      <div className="absolute inset-0 bg-black/20 -z-10" />
      <Card className="w-full max-w-md bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-6 sm:p-8 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800 text-center">
          <CardTitle className="font-heading text-3xl text-green-800 dark:text-green-200 flex items-center justify-center gap-2">
            🌾 Didysis Ūkis
          </CardTitle>
          <p className="text-green-600 dark:text-green-300">Lietuviška ūkio simuliacija</p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md">
          <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
              <strong>Supaprastinta:</strong> Registracija dabar veikia automatiškai per trigger'ius. Jei registracija
              nepavyksta, bandykite prisijungti.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-yellow-100/50 dark:bg-yellow-900/20 border-2 border-yellow-700 dark:border-yellow-800 rounded-lg">
              <TabsTrigger
                value="prisijungimas"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
              >
                Prisijungimas
              </TabsTrigger>
              <TabsTrigger
                value="registracija"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
              >
                Registracija
              </TabsTrigger>
              <TabsTrigger
                value="atkurimas"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
              >
                Atkūrimas
              </TabsTrigger>
            </TabsList>

            {/* Prisijungimas */}
            <TabsContent value="prisijungimas" className="space-y-4 mt-4 text-green-900 dark:text-green-100">
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
                  className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                    errors.email ? "border-red-500" : ""
                  }`}
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
                    className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600 dark:text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button
                onClick={handleSignIn}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Jungiamasi...
                  </>
                ) : (
                  "Prisijungti"
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  variant="link"
                  className="text-sm text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-400"
                  onClick={() => setActiveTab("atkurimas")}
                >
                  Pamiršote slaptažodį?
                </Button>
                <div className="text-sm text-gray-500 dark:text-gray-400">arba</div>
                <Button
                  variant="outline"
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                  onClick={() => router.push("/game?demo=true")}
                >
                  Tęsti demo režimu
                </Button>
              </div>
            </TabsContent>

            {/* Registracija */}
            <TabsContent value="registracija" className="space-y-4 text-green-900 dark:text-green-100">
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
                  className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                    errors.email ? "border-red-500" : ""
                  }`}
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
                  className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                    errors.slapyvardis ? "border-red-500" : ""
                  }`}
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
                  className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                    errors.ukioPavadinimas ? "border-red-500" : ""
                  }`}
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
                    className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600 dark:text-gray-400"
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
                    className={`bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 ${
                      errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-600 dark:text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button
                onClick={handleSignUp}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registruojamasi...
                  </>
                ) : (
                  "Registruotis"
                )}
              </Button>

              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                  Registruodamiesi sutinkate su mūsų naudojimo sąlygomis ir privatumo politika. Registracija vyksta
                  automatiškai!
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Slaptažodžio atkūrimas */}
            <TabsContent value="atkurimas" className="space-y-4 text-green-900 dark:text-green-100">
              {!resetSent ? (
                <>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Slaptažodžio atkūrimas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordReset}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 font-semibold"
                    disabled={loading}
                  >
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
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Nuoroda išsiųsta!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Patikrinkite savo el. paštą <strong>{resetEmail}</strong> ir sekite instrukcijas slaptažodžio
                      atkūrimui.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
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
                <Button
                  variant="link"
                  className="text-sm text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-400"
                  onClick={() => setActiveTab("prisijungimas")}
                >
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
