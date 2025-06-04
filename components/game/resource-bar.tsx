"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Isteklius } from "@/lib/supabase"
import { Coins, Wheat, Apple, Milk, Egg, Beef } from "lucide-react"

interface ResourceBarProps {
  istekliai: Isteklius[]
  pinigai: number
  patirtis: number
  lygis: number
}

export function ResourceBar({ istekliai, pinigai, patirtis, lygis }: ResourceBarProps) {
  const getResourceAmount = (tipas: string) => {
    const isteklius = istekliai.find((i) => i.tipas === tipas)
    return isteklius?.kiekis || 0
  }

  const getResourceIcon = (tipas: string) => {
    const icons = {
      grudai: <Wheat className="h-4 w-4 text-amber-600" />,
      vaisiai: <Apple className="h-4 w-4 text-red-500" />,
      pienas: <Milk className="h-4 w-4 text-blue-500" />,
      kiausiniai: <Egg className="h-4 w-4 text-yellow-500" />,
      mesa: <Beef className="h-4 w-4 text-red-700" />,
    }
    return icons[tipas as keyof typeof icons] || null
  }

  const patirtisKitamLygiui = lygis * 100
  const patirtisProgresas = ((patirtis % patirtisKitamLygiui) / patirtisKitamLygiui) * 100

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Pinigai ir lygis */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{pinigai.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lygis {lygis}</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${patirtisProgresas}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ištekliai */}
          <div className="flex gap-4">
            {["grudai", "vaisiai", "pienas", "kiausiniai", "mesa"].map((tipas) => (
              <div key={tipas} className="flex items-center gap-1">
                {getResourceIcon(tipas)}
                <span className="text-sm">{getResourceAmount(tipas)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
