"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TooltipIcon } from "@/components/ui/tooltip-icon"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import type { Isteklius } from "@/lib/supabase"
import { Coins, Wheat, Apple, Milk, Egg, Beef, Star } from "lucide-react"
import { motion } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"

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
      grudai: <Wheat className="h-5 w-5 text-amber-600" />,
      vaisiai: <Apple className="h-5 w-5 text-red-500" />,
      pienas: <Milk className="h-5 w-5 text-blue-500" />,
      kiausiniai: <Egg className="h-5 w-5 text-yellow-500" />,
      mesa: <Beef className="h-5 w-5 text-red-700" />,
    }
    return icons[tipas as keyof typeof icons] || null
  }

  const patirtisKitamLygiui = lygis * 100
  const patirtisProgresas = ((patirtis % patirtisKitamLygiui) / patirtisKitamLygiui) * 100

  const resourceTypes = ["grudai", "vaisiai", "pienas", "kiausiniai", "mesa"]
  const resourceNames = {
    grudai: "Grūdai",
    vaisiai: "Vaisiai",
    pienas: "Pienas",
    kiausiniai: "Kiaušiniai",
    mesa: "Mėsa",
  }

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <TooltipProvider>
        <Card className="mb-4 overflow-hidden border-4 border-yellow-800 dark:border-yellow-900 shadow-lg bg-yellow-600/80 dark:bg-yellow-700/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="bg-yellow-50 dark:bg-yellow-800/30 p-3 rounded-md">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {/* Pinigai ir lygis */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-yellow-300 dark:border-yellow-700">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <AnimatedCounter
                      value={pinigai}
                      className="font-semibold text-green-800 dark:text-green-200"
                      formatValue={(val) => val.toLocaleString()}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <TooltipIcon
                        icon={
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-semibold shadow-sm border border-amber-700">
                            {lygis}
                          </div>
                        }
                        content={
                          <div className="text-center">
                            <div className="font-semibold mb-1">Ūkininko lygis</div>
                            <div className="text-xs">
                              Patirtis: {patirtis} / {patirtisKitamLygiui}
                            </div>
                          </div>
                        }
                      />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                        style={{ width: `${patirtisProgresas}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ištekliai */}
                <div className="flex gap-3 flex-wrap justify-end">
                  {resourceTypes.map((tipas) => (
                    <TooltipIcon
                      key={tipas}
                      icon={
                        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full shadow-sm border border-yellow-300 dark:border-yellow-700">
                          {getResourceIcon(tipas)}
                          <AnimatedCounter
                            value={getResourceAmount(tipas)}
                            className="text-sm font-medium text-green-800 dark:text-green-200"
                          />
                        </div>
                      }
                      content={
                        <div>
                          <div className="font-semibold">{resourceNames[tipas as keyof typeof resourceNames]}</div>
                          <div className="text-xs">Turimas kiekis: {getResourceAmount(tipas)}</div>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </motion.div>
  )
}
