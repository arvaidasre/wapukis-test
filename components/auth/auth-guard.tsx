"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authFunctions } from "@/lib/supabase"
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
    } = authFunctions.onAuthStateChange((event, session) => {
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

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...")
      const { user, error } = await authFunctions.getCurrentUser()

      console.log("Auth check result:", { user, error })

      if (user && !error) {
        console.log("User is authenticated")
        setAuthenticated(true)
        setShowDemo(false)
      } else {
        console.log("User is not authenticated, showing demo option")
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
