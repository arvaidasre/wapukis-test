"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/auth/password-strength"
import { useToast } from "@/components/ui/use-toast"
import { authFunctions } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken && refreshToken) {
      setSession(accessToken, refreshToken)
    }
  }, [searchParams])

  const setSession = async (accessToken: string, refreshToken: string) => {
    try {
      const { data, error } = await authFunctions.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) throw error

      toast({
        title: "Sesija nustatyta",
        description: "Dabar galite atnaujinti savo slaptažodį.",
      })
    } catch (error: any) {
      console.error("Session error:", error)
      toast({
        title: "Klaida",
        description: "Nepavyko nustatyti sesijos. Bandykite dar kartą.",
        variant: "destructive",
      })
      router.push("/auth")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = "Slaptažodis yra privalomas"
    } else if (formData.password.length < 8) {
      newErrors.password = "Slaptažodis turi būti mažiausiai 8 simbolių"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Patvirtinkite slaptažodį"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Slaptažodžiai nesutampa"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdatePassword = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const { error } = await authFunctions.updatePassword(formData.password)

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Slaptažodis atnaujintas! 🎉",
        description: "Jūsų slaptažodis sėkmingai atnaujintas.",
      })

      setTimeout(() => {
        router.push("/auth")
      }, 3000)
    } catch (error: any) {
      console.error("Password update error:", error)
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko atnaujinti slaptažodžio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
              <CheckCircle className="h-8 w-8 text-green-600" />
              Sėkmingai atnaujinta!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-center space-y-4 text-green-900 dark:text-green-100">
            <div className="text-6xl">🎉</div>
            <div>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">Slaptažodis atnaujintas!</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Jūsų slaptažodis sėkmingai atnaujintas. Netrukus būsite nukreipti į prisijungimo puslapį.
              </p>
            </div>
            <Button
              onClick={() => router.push("/auth")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 font-semibold"
            >
              Eiti į prisijungimą
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            <Lock className="h-6 w-6" />
            Atnaujinti slaptažodį
          </CardTitle>
          <p className="text-green-600 dark:text-green-300">Įveskite naują slaptažodį</p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md space-y-4 text-green-900 dark:text-green-100">
          <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
              Sukurkite stiprų slaptažodį, kuris atitiks visus saugumo reikalavimus.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <Lock className="h-4 w-4" />
              Naujas slaptažodis
            </Label>
            <div className="relative">
              <Input
                id="new-password"
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
            <Label
              htmlFor="confirm-new-password"
              className="flex items-center gap-2 text-green-900 dark:text-green-100"
            >
              <Lock className="h-4 w-4" />
              Patvirtinti naują slaptažodį
            </Label>
            <div className="relative">
              <Input
                id="confirm-new-password"
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
            onClick={handleUpdatePassword}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atnaujinama...
              </>
            ) : (
              "Atnaujinti slaptažodį"
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-green-600 dark:text-green-300 hover:text-green-700 dark:hover:text-green-400"
              onClick={() => router.push("/auth")}
            >
              Grįžti į prisijungimą
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
