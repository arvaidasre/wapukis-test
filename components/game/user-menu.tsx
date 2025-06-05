"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { authFunctions, dbFunctions } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut, Crown, Calendar } from "lucide-react"

interface UserMenuProps {
  lygis: number
  patirtis: number
}

export function UserMenu({ lygis, patirtis }: UserMenuProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const hasSession = await authFunctions.hasActiveSession()

      if (!hasSession) {
        console.log("No active session found in UserMenu")
        return
      }

      const { user } = await authFunctions.getCurrentUser()
      if (!user) {
        console.log("No user found in UserMenu")
        return
      }

      setUser(user)

      const { data: profile } = await dbFunctions.supabase.from("vartotojai").select("*").eq("id", user.id).single()

      if (profile) {
        setUserProfile(profile)
      }
    } catch (error) {
      console.log("Error loading user data:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await authFunctions.signOut()

      if (error) throw error

      toast({
        title: "Atsijungta sėkmingai",
        description: "Iki pasimatymo! 👋",
      })

      router.push("/auth")
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast({
        title: "Klaida",
        description: "Nepavyko atsijungti",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = () => {
    if (userProfile?.slapyvardis) {
      return userProfile.slapyvardis.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const getLevelBadgeColor = () => {
    if (lygis >= 20) return "bg-purple-500"
    if (lygis >= 15) return "bg-yellow-500"
    if (lygis >= 10) return "bg-blue-500"
    if (lygis >= 5) return "bg-green-500"
    return "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-100/50 dark:bg-yellow-900/20 hover:bg-yellow-200/50 dark:hover:bg-yellow-800/30"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-lime-100 text-lime-800 dark:bg-lime-800 dark:text-lime-100">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <Badge className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs ${getLevelBadgeColor()}`}>
            {lygis}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-yellow-50 dark:bg-gray-800 border-2 border-yellow-700 dark:border-yellow-900 shadow-lg text-green-900 dark:text-green-100"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{userProfile?.slapyvardis || "Ūkininkas"}</span>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>

            <div className="flex items-center justify-between">
              <div className="text-xs">
                <span className="font-medium">Lygis {lygis}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{patirtis} XP</div>
            </div>

            {userProfile?.sukurimo_data && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                Narys nuo {formatDate(userProfile.sukurimo_data)}
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-yellow-200 dark:bg-yellow-700" />

        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 focus:bg-yellow-100 dark:focus:bg-yellow-900">
          <User className="mr-2 h-4 w-4" />
          <span>Profilis</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 focus:bg-yellow-100 dark:focus:bg-yellow-900">
          <Settings className="mr-2 h-4 w-4" />
          <span>Nustatymai</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-yellow-200 dark:bg-yellow-700" />

        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 focus:bg-red-50 dark:focus:bg-red-900"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Atsijungti</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
