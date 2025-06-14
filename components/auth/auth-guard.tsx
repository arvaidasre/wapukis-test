"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session)
      if (event === "SIGNED_IN") {
        setAuthenticated(true)
        setLoading(false)
        setShowDemo(false)
      } else if (event === "SIGNED_OUT") {
        setAuthenticated(false)
        setShowDemo(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fix the AuthGuard component to handle authentication errors better
  const checkAuth = async () => {
    try {
      console.log("Checking authentication...")

      // Pirmiausia patikriname, ar yra aktyvi sesija
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setAuthenticated(false)
        setShowDemo(true)
        setLoading(false)
        return
      }

      if (!sessionData?.session) {
        console.log("No active session found, showing demo option")
        setAuthenticated(false)
        setShowDemo(true)
        setLoading(false)
        return
      }

      // Jei yra sesija, bandome gauti vartotoją
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          console.log("No user found, showing demo option")
          setAuthenticated(false)
          setShowDemo(true)
        } else {
          console.log("User is authenticated:", user.id)
          setAuthenticated(true)
          setShowDemo(false)
        }
      } catch (userError) {
        console.error("User fetch error:", userError)
        setAuthenticated(false)
        setShowDemo(true)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setAuthenticated(false)
      setShowDemo(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    console.log("Entering demo mode")
    setAuthenticated(true)
    setShowDemo(false)
  }

  const handleGoToAuth = () => {
    router.push("/auth")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Kraunama...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600">Tikrinamas prisijungimas...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showDemo && !authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-green-800">🌾 Didysis Ūkis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">Pasirinkite, kaip norite naudoti aplikaciją:</div>
            <div className="space-y-2">
              <Button onClick={handleGoToAuth} className="w-full">
                Prisijungti / Registruotis
              </Button>
              <Button onClick={handleDemoMode} variant="outline" className="w-full">
                Tęsti demo režimu
              </Button>
            </div>
            <div className="text-xs text-gray-500 text-center">Demo režime duomenys nebus išsaugoti</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}
