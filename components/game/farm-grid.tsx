"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useAccessibility } from "@/lib/accessibility"
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
  const { state, announce } = useAccessibility()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [focusedSlot, setFocusedSlot] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gridRef.current || !focusedSlot) return

      const [currentX, currentY] = focusedSlot.split("-").map(Number)
      let newX = currentX
      let newY = currentY

      switch (e.key) {
        case "ArrowUp":
          newY = Math.max(0, currentY - 1)
          e.preventDefault()
          break
        case "ArrowDown":
          newY = Math.min(3, currentY + 1)
          e.preventDefault()
          break
        case "ArrowLeft":
          newX = Math.max(0, currentX - 1)
          e.preventDefault()
          break
        case "ArrowRight":
          newX = Math.min(3, currentX + 1)
          e.preventDefault()
          break
        case "Enter":
        case " ":
          const pastatas = pastatai.find((p) => p.pozicija_x === currentX && p.pozicija_y === currentY)
          if (pastatas) {
            onBuildingClick(pastatas)
          } else {
            onEmptySlotClick(currentX, currentY)
          }
          e.preventDefault()
          break
        default:
          return
      }

      if (newX !== currentX || newY !== currentY) {
        const newSlotId = `${newX}-${newY}`
        setFocusedSlot(newSlotId)

        const newSlotElement = document.getElementById(`farm-slot-${newSlotId}`)
        if (newSlotElement) {
          newSlotElement.focus()

          const pastatas = pastatai.find((p) => p.pozicija_x === newX && p.pozicija_y === newY)
          if (pastatas) {
            const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]
            announce(`Pozicija ${newX + 1}, ${newY + 1}: ${pastatoTipas?.pavadinimas}, ${pastatas.lygis} lygio`)

            const laukoAugalai = augalai.filter((a) => a.lauko_id === pastatas.id)
            const tvartoGyvunai = gyvunai.filter((g) => g.tvarto_id === pastatas.id)

            if (laukoAugalai.length > 0) {
              const augalas = laukoAugalai[0]
              const augaloTipas = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]
              const paruostas = new Date() >= new Date(augalas.derliaus_data)
              announce(`Auga ${augaloTipas?.pavadinimas}, ${paruostas ? "paruošta derliui" : "dar auga"}`)
            }

            if (tvartoGyvunai.length > 0) {
              announce(`Tvarte yra ${tvartoGyvunai.length} gyvūnai`)
            }
          } else {
            announce(`Pozicija ${newX + 1}, ${newY + 1}: Tuščias laukas`)
          }
        }
      }
    }

    if (focusedSlot) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [focusedSlot, pastatai, augalai, gyvunai, onBuildingClick, onEmptySlotClick, announce])

  const renderGridSlot = (x: number, y: number) => {
    const slotId = `${x}-${y}`
    const pastatas = pastatai.find((p) => p.pozicija_x === x && p.pozicija_y === y)
    const isHovered = hoveredSlot === slotId
    const isFocused = focusedSlot === slotId

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
            id={`farm-slot-${slotId}`}
            tabIndex={0}
            role="button"
            aria-label={`Tuščias laukas pozicijoje ${x + 1}, ${y + 1}`}
            className={`h-full border-2 border-dashed ${
              isHovered || isFocused
                ? "border-amber-400 bg-amber-50/20 dark:border-amber-600 dark:bg-amber-900/20"
                : "border-yellow-300 dark:border-yellow-700"
            } hover:border-amber-400 hover:bg-amber-50/20 dark:hover:bg-amber-900/20 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-yellow-50 dark:bg-yellow-800/30`}
            onClick={() => onEmptySlotClick(x, y)}
            onMouseEnter={() => setHoveredSlot(slotId)}
            onMouseLeave={() => setHoveredSlot(null)}
            onFocus={() => {
              setFocusedSlot(slotId)
              if (state.screenReaderEnabled) {
                announce(`Tuščias laukas pozicijoje ${x + 1}, ${y + 1}. Paspauskite Enter, kad statytumėte.`)
              }
            }}
            onBlur={() => {
              if (focusedSlot === slotId) {
                setFocusedSlot(null)
              }
            }}
          >
            <CardContent className="flex items-center justify-center h-full p-2">
              <motion.span
                className="text-gray-400 text-2xl"
                animate={{ scale: isHovered || isFocused ? 1.2 : 1 }}
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

    const laukoAugalai = augalai.filter((a) => a.lauko_id === pastatas.id)

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

    let accessibleDescription = `${pastatoTipas?.pavadinimas}, ${pastatas.lygis} lygio, pozicijoje ${x + 1}, ${y + 1}.`

    if (progressInfo) {
      accessibleDescription += ` Auga ${progressInfo.tipas}, ${progressInfo.paruostas ? "paruošta derliui" : `${Math.round(progressInfo.progresas)}% užaugę`}.`
    }

    if (pastatas.tipas === "tvartas" && tvartoGyvunai.length > 0) {
      accessibleDescription += ` Tvarte yra ${tvartoGyvunai.length} gyvūnai.`
    }

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
          id={`farm-slot-${slotId}`}
          tabIndex={0}
          role="button"
          aria-label={accessibleDescription}
          className={`h-full hover:shadow-lg cursor-pointer transition-all duration-200 ${
            isHovered || isFocused ? "ring-2 ring-amber-400 ring-opacity-50" : ""
          } overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500 bg-yellow-50 dark:bg-yellow-800/30 border-2 border-yellow-300 dark:border-yellow-700`}
          onClick={() => onBuildingClick(pastatas)}
          onMouseEnter={() => setHoveredSlot(slotId)}
          onMouseLeave={() => setHoveredSlot(null)}
          onFocus={() => {
            setFocusedSlot(slotId)
            if (state.screenReaderEnabled) {
              announce(accessibleDescription + " Paspauskite Enter, kad valdytumėte.")
            }
          }}
          onBlur={() => {
            if (focusedSlot === slotId) {
              setFocusedSlot(null)
            }
          }}
        >
          <CardContent className="p-2 h-full flex flex-col justify-between relative text-green-900 dark:text-green-100">
            <div className="flex justify-between items-start">
              <motion.span
                className="text-2xl"
                animate={{ rotate: isHovered || isFocused ? [0, -5, 5, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {pastatoTipas?.ikona}
              </motion.span>
              <Badge
                variant="secondary"
                className="text-xs bg-lime-200 text-lime-800 dark:bg-lime-800 dark:text-lime-200 border border-lime-300 dark:border-lime-700"
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
                      className="h-1.5 bg-gray-200 dark:bg-gray-700"
                      indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-500"
                      aria-label={`Augimo progresas: ${Math.round(progressInfo.progresas)}%`}
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge
                        variant="default"
                        className="text-xs w-full justify-center bg-amber-500 hover:bg-amber-600 text-white border border-amber-700"
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
            {(isHovered || isFocused) && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none"
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
    <div
      ref={gridRef}
      className="grid grid-cols-4 gap-3 p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-700 dark:border-yellow-800"
      role="grid"
      aria-label="Ūkio žemėlapis"
    >
      {Array.from({ length: 16 }, (_, index) => {
        const x = index % 4
        const y = Math.floor(index / 4)
        return renderGridSlot(x, y)
      })}
    </div>
  )
}
