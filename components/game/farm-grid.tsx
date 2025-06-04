"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const renderGridSlot = (x: number, y: number) => {
    const pastatas = pastatai.find((p) => p.pozicija_x === x && p.pozicija_y === y)

    if (!pastatas) {
      return (
        <Card
          key={`${x}-${y}`}
          className="h-24 border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer transition-colors"
          onClick={() => onEmptySlotClick(x, y)}
        >
          <CardContent className="flex items-center justify-center h-full p-2">
            <span className="text-gray-400 text-2xl">+</span>
          </CardContent>
        </Card>
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
      <Card
        key={`${x}-${y}`}
        className="h-24 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onBuildingClick(pastatas)}
      >
        <CardContent className="p-2 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-2xl">{pastatoTipas?.ikona}</span>
            <Badge variant="secondary" className="text-xs">
              Lv.{pastatas.lygis}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium truncate">{pastatoTipas?.pavadinimas}</div>

            {progressInfo && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <span>{progressInfo.ikona}</span>
                  <span className="truncate">{progressInfo.tipas}</span>
                </div>
                {!progressInfo.paruostas ? (
                  <Progress value={progressInfo.progresas} className="h-1" />
                ) : (
                  <Badge variant="default" className="text-xs w-full justify-center">
                    Paruošta!
                  </Badge>
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
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {Array.from({ length: 16 }, (_, index) => {
        const x = index % 4
        const y = Math.floor(index / 4)
        return renderGridSlot(x, y)
      })}
    </div>
  )
}
