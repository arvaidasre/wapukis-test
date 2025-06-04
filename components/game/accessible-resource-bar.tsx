"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TooltipIcon } from "@/components/ui/tooltip-icon"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useAccessibility } from "@/lib/accessibility"
import type { Isteklius } from "@/lib/supabase"
import { Coins, Wheat, Apple, Milk, Egg, Beef, Star } from "lucide-react"
import { motion } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AccessibleResourceBarProps {
  istekliai: Isteklius[]
  pinigai: number
  patirtis: number
  lygis: number
}

export function AccessibleResourceBar({ istekliai, pinigai, patirtis, lygis }: AccessibleResourceBarProps) {
  const { state, announce } = useAccessibility()

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

  // Sukurti prieinamą aprašymą
  const getResourceSummary = () => {
    const resourceSummary = resourceTypes
      .map((tipas) => {
        const kiekis = getResourceAmount(tipas)
        const pavadinimas = resourceNames[tipas as keyof typeof resourceNames]
        return `${pavadinimas}: ${kiekis}`
      })
      .join(", ")

    return `Jūsų ištekliai: Pinigai: ${pinigai}, ${resourceSummary}. Lygis: ${lygis}, Patirtis: ${patirtis} iš ${patirtisKitamLygiui} reikalingų kitam lygiui.`
  }

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <TooltipProvider>
        <Card
          className="mb-4 overflow-hidden border-none shadow-md"
          tabIndex={0}
          role="region"
          aria-label="Išteklių juosta"
          onFocus={() => {
            if (state.screenReaderEnabled) {
              announce(getResourceSummary())
            }
          }}
        >
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-3">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {/* Pinigai ir lygis */}
                <div className="flex items-center gap-6">
                  <div
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm"
                    role="status"
                    aria-label={`Pinigai: ${pinigai}`}
                  >
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <AnimatedCounter
                      value={pinigai}
                      className="font-semibold"
                      formatValue={(val) => val.toLocaleString()}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <TooltipIcon
                        icon={
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-semibold shadow-sm"
                            role="status"
                            aria-label={`Lygis: ${lygis}`}
                          >
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
                    <div
                      className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={patirtisProgresas}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Patirties progresas: ${Math.round(patirtisProgresas)}%`}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
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
                        <div
                          className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full shadow-sm"
                          role="status"
                          aria-label={`${resourceNames[tipas as keyof typeof resourceNames]}: ${getResourceAmount(tipas)}`}
                        >
                          {getResourceIcon(tipas)}
                          <AnimatedCounter value={getResourceAmount(tipas)} className="text-sm font-medium" />
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
