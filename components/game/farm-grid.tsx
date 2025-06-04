"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import type { Pastatas, Augalas, Gyvunas } from "@/lib/supabase"
import { AUGALU_TIPAI, GYVUNU_TIPAI, PASTATU_TIPAI } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"

interface FarmGridProps {
  pastatai: Pastatas[]
  augalai: Augalas[]
  gyvunai: Gyvunas[]
  onBuildingClick: (pastatas: Pastatas) => void
  onEmptySlotClick: (x: number, y: number) => void
}

export function FarmGrid({ pastatai, augalai, gyvunai, onBuildingClick, onEmptySlotClick }: FarmGridProps) {
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const renderGridSlot = (x: number, y: number) => {
    const slotId = `${x}-${y}`
    const pastatas = pastatai.find((p) => p.pozicija_x === x && p.pozicija_y === y)
    const isHovered = hoveredSlot === slotId

    if (!pastatas) {
      return (
        <motion.div
          key={slotId}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: x * 0.1 + y * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="aspect-square"
        >
          <Card
            className={`h-full border-2 border-dashed ${
              isHovered ? "border-green-400 bg-green-50" : "border-gray-200 dark:border-gray-700"
            } hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-all duration-200`}
            onClick={() => onEmptySlotClick(x, y)}
            onMouseEnter={() => setHoveredSlot(slotId)}
            onMouseLeave={() => setHoveredSlot(null)}
          >
            <CardContent className="flex items-center justify-center h-full p-2">
              <motion.span
                className="text-gray-400 text-2xl"
                animate={{ scale: isHovered ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
              >
                +
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]

    // Rasti augalus šiame lauke
    const laukoAugalai = augalai.filter((a) => a.lauko_id === pastatas.id)

    // Rasti gyvūnus šiame tvarte
    const tvartoGyvunai = gyvunai.filter((g) => g.tvarto_id === pastatas.id)

    const getProgressInfo = () => {
      if (pastatas.tipas === "laukas" && laukoAugalai.length > 0) {
        const augalas = laukoAugalai[0]
        const augaloTipas = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]
        const sodinimo = new Date(augalas.sodinimo_data)
        const derliaus = new Date(augalas.derliaus_data)
        const dabar = currentTime

        const bendrasLaikas = derliaus.getTime() - sodinimo.getTime()
        const praejusLaikas = dabar.getTime() - sodinimo.getTime()
        const progresas = Math.min((praejusLaikas / bendrasLaikas) * 100, 100)

        return {
          progresas,
          paruostas: dabar >= derliaus,
          tipas: augaloTipas.pavadinimas,
          ikona: augaloTipas.ikona,
        }
      }

      return null
    }

    const progressInfo = getProgressInfo()

    return (
      <motion.div
        key={slotId}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: x * 0.1 + y * 0.1 }}
        whileHover={{ scale: 1.03 }}
        className="aspect-square"
      >
        <Card
          className={`h-full hover:shadow-lg cursor-pointer transition-all duration-200 ${
            isHovered ? "ring-2 ring-green-400 ring-opacity-50" : ""
          } overflow-hidden`}
          onClick={() => onBuildingClick(pastatas)}
          onMouseEnter={() => setHoveredSlot(slotId)}
          onMouseLeave={() => setHoveredSlot(null)}
        >
          <CardContent className="p-2 h-full flex flex-col justify-between relative">
            <div className="flex justify-between items-start">
              <motion.span
                className="text-2xl"
                animate={{ rotate: isHovered ? [0, -5, 5, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {pastatoTipas?.ikona}
              </motion.span>
              <Badge
                variant="secondary"
                className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900"
              >
                Lv.{pastatas.lygis}
              </Badge>
            </div>

            <div className="space-y-1 z-10">
              <div className="text-xs font-medium truncate">{pastatoTipas?.pavadinimas}</div>

              {progressInfo && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs">
                    <span>{progressInfo.ikona}</span>
                    <span className="truncate">{progressInfo.tipas}</span>
                  </div>
                  {!progressInfo.paruostas ? (
                    <Progress
                      value={progressInfo.progresas}
                      className="h-1.5 bg-gray-100 dark:bg-gray-800"
                      indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge
                        variant="default"
                        className="text-xs w-full justify-center bg-green-500 hover:bg-green-600"
                      >
                        Paruošta!
                      </Badge>
                    </motion.div>
                  )}
                </div>
              )}

              {pastatas.tipas === "tvartas" && tvartoGyvunai.length > 0 && (
                <div className="text-xs">
                  {tvartoGyvunai.map((g) => {
                    const gyvunoTipas = GYVUNU_TIPAI[g.tipas as keyof typeof GYVUNU_TIPAI]
                    return (
                      <div key={g.id} className="flex items-center gap-1">
                        <span>{gyvunoTipas?.ikona}</span>
                        <span className="truncate">{g.vardas || gyvunoTipas?.pavadinimas}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dekoratyviniai elementai */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
      {Array.from({ length: 16 }, (_, index) => {
        const x = index % 4
        const y = Math.floor(index / 4)
        return renderGridSlot(x, y)
      })}
    </div>
  )
}
