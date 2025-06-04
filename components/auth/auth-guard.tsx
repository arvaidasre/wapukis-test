"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authFunctions } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = authFunctions.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setAuthenticated(true)
        setLoading(false)
      } else if (event === "SIGNED_OUT") {
        setAuthenticated(false)
        router.push("/auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const checkAuth = async () => {
    try {
      const { user } = await authFunctions.getCurrentUser()

      if (user) {
        setAuthenticated(true)
      } else {
        router.push("/auth")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/auth")
    } finally {
      setLoading(false)
    }
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

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}
