"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { debugAuth } from "@/lib/debug-helper"

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [farmInfo, setFarmInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      // Sesijos informacija
      const { data: sessionData } = await supabase.auth.getSession()
      setSessionInfo(sessionData)

      // Vartotojo informacija
      if (sessionData?.session) {
        const { data: userData } = await supabase.auth.getUser()
        setUserInfo(userData)

        // Profilio informacija
        if (userData?.user) {
          const { data: profileData } = await supabase
            .from("vartotojai")
            .select("*")
            .eq("id", userData.user.id)
            .single()
          setProfileInfo(profileData)

          // Ūkio informacija
          const { data: farmData } = await supabase
            .from("ukiai")
            .select("*")
            .eq("vartotojo_id", userData.user.id)
            .single()
          setFarmInfo(farmData)
        }
      }
    } catch (error) {
      console.error("Debug info error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const runFullDebug = async () => {
    await debugAuth(supabase)
    await fetchDebugInfo()
  }

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Derinimo puslapis</span>
              <Button onClick={runFullDebug} disabled={loading}>
                {loading ? "Kraunama..." : "Atnaujinti informaciją"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Šis puslapis rodo detalią informaciją apie jūsų autentifikacijos būseną ir duomenų bazės įrašus.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sesijos informacija</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {formatJson(sessionInfo)}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Vartotojo informacija</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">{formatJson(userInfo)}</pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Profilio informacija</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {formatJson(profileInfo)}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Ūkio informacija</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">{formatJson(farmInfo)}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Grįžti į pagrindinį puslapį
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/auth"
            }}
          >
            Atsijungti
          </Button>
        </div>
      </div>
    </div>
  )
}
