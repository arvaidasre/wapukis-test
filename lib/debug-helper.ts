// Pagalbinė funkcija derinimui

export const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
  console.log(`[${timestamp}] ${message}`)
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2))
  }
}

export const debugAuth = async (supabase: any) => {
  try {
    // Patikrinti sesiją
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    debugLog("Current session:", sessionData)
    if (sessionError) {
      debugLog("Session error:", sessionError)
    }

    // Patikrinti vartotoją
    if (sessionData?.session) {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      debugLog("Current user:", userData)
      if (userError) {
        debugLog("User error:", userError)
      }

      // Patikrinti vartotojo profilį
      if (userData?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("vartotojai")
          .select("*")
          .eq("id", userData.user.id)
          .single()

        debugLog("User profile:", profileData)
        if (profileError) {
          debugLog("Profile error:", profileError)
        }
      }
    }
  } catch (error) {
    debugLog("Debug auth error:", error)
  }
}
