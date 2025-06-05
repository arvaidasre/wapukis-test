"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useAccessibility } from "@/lib/accessibility"
import { motion } from "framer-motion"
import type { Isteklius } from "@/lib/supabase"
import { RINKOS_KAINOS } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"
import { Coins, Wheat, Apple, Milk, Egg, Beef } from "lucide-react"

interface MarketDialogProps {
  open: boolean
  onClose: () => void
  istekliai: Isteklius[]
  pinigai: number
  onBuyResource: (tipas: string, kiekis: number) => void
  onSellResource: (tipas: string, kiekis: number) => void
}

export function MarketDialog({ open, onClose, istekliai, pinigai, onBuyResource, onSellResource }: MarketDialogProps) {
  const { toast } = useToast()
  const { state, announce } = useAccessibility()
  const [activeTab, setActiveTab] = useState("pirkimas")
  const [buyAmounts, setBuyAmounts] = useState<Record<string, number>>({})
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (open && state.screenReaderEnabled) {
      announce(`Rinkos langas atidarytas. Jūsų pinigai: ${pinigai}.`)
    }
  }, [open, pinigai, state.screenReaderEnabled, announce])

  useEffect(() => {
    if (open && state.screenReaderEnabled) {
      announce(`Pasirinktas ${activeTab === "pirkimas" ? "pirkimo" : "pardavimo"} skirtukas`)
    }
  }, [activeTab, open, state.screenReaderEnabled, announce])

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

  const resourceTypes = ["grudai", "vaisiai", "pienas", "kiausiniai", "mesa"]
  const resourceNames = {
    grudai: "Grūdai",
    vaisiai: "Vaisiai",
    pienas: "Pienas",
    kiausiniai: "Kiaušiniai",
    mesa: "Mėsa",
  }

  const handleBuy = (tipas: string) => {
    const kiekis = buyAmounts[tipas] || 0
    if (kiekis <= 0) {
      toast({
        title: "Neteisingas kiekis",
        description: "Įveskite teigiamą kiekį.",
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce("Klaida: Neteisingas kiekis. Įveskite teigiamą kiekį.", "assertive")
      }
      return
    }

    const kaina = RINKOS_KAINOS[tipas as keyof typeof RINKOS_KAINOS].pirkimo * kiekis
    if (pinigai < kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${kaina} monetų.`,
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce(`Klaida: Nepakanka pinigų. Reikia ${kaina} monetų.`, "assertive")
      }
      return
    }

    onBuyResource(tipas, kiekis)
    setBuyAmounts((prev) => ({ ...prev, [tipas]: 0 }))
    if (state.screenReaderEnabled) {
      announce(`Nupirkta ${kiekis} ${resourceNames[tipas as keyof typeof resourceNames]}.`)
    }
  }

  const handleSell = (tipas: string) => {
    const kiekis = sellAmounts[tipas] || 0
    if (kiekis <= 0) {
      toast({
        title: "Neteisingas kiekis",
        description: "Įveskite teigiamą kiekį.",
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce("Klaida: Neteisingas kiekis. Įveskite teigiamą kiekį.", "assertive")
      }
      return
    }

    const turimasKiekis = getResourceAmount(tipas)
    if (turimasKiekis < kiekis) {
      toast({
        title: "Nepakanka išteklių",
        description: `Turite tik ${turimasKiekis} ${resourceNames[tipas as keyof typeof resourceNames]}.`,
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce(
          `Klaida: Nepakanka išteklių. Turite tik ${turimasKiekis} ${resourceNames[tipas as keyof typeof resourceNames]}.`,
          "assertive",
        )
      }
      return
    }

    onSellResource(tipas, kiekis)
    setSellAmounts((prev) => ({ ...prev, [tipas]: 0 }))
    if (state.screenReaderEnabled) {
      announce(`Parduota ${kiekis} ${resourceNames[tipas as keyof typeof resourceNames]}.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl"
        aria-labelledby="market-dialog-title"
      >
        <DialogHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
          <DialogTitle
            id="market-dialog-title"
            className="flex items-center gap-2 text-xl font-heading text-green-800 dark:text-green-200"
          >
            <Coins className="h-6 w-6 text-yellow-500" />
            Rinka
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-green-900 dark:text-green-100">
          <div className="flex items-center justify-between mb-4 p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-md border border-yellow-300 dark:border-yellow-700">
            <span className="font-semibold">Jūsų pinigai:</span>
            <div className="flex items-center gap-1">
              <Coins className="h-5 w-5 text-yellow-500" />
              <AnimatedCounter value={pinigai} className="font-bold text-lg" />
            </div>
          </div>

          <Tabs
            defaultValue="pirkimas"
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-2 bg-yellow-100/50 dark:bg-yellow-900/20 border-2 border-yellow-700 dark:border-yellow-800 rounded-lg">
              <TabsTrigger
                value="pirkimas"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
                aria-controls="pirkimas-tab"
              >
                Pirkimas
              </TabsTrigger>
              <TabsTrigger
                value="pardavimas"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
                aria-controls="pardavimas-tab"
              >
                Pardavimas
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="pirkimas"
              className="space-y-4 mt-4"
              id="pirkimas-tab"
              role="tabpanel"
              aria-label="Pirkimo skirtukas"
            >
              {resourceTypes.map((tipas) => (
                <motion.div
                  key={tipas}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm border-yellow-300 dark:border-yellow-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getResourceIcon(tipas)}</div>
                    <div>
                      <div className="font-medium">{resourceNames[tipas as keyof typeof resourceNames]}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Pirkimo kaina: {RINKOS_KAINOS[tipas as keyof typeof RINKOS_KAINOS].pirkimo} 💰
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={buyAmounts[tipas] || ""}
                      onChange={(e) =>
                        setBuyAmounts((prev) => ({ ...prev, [tipas]: Number.parseInt(e.target.value) || 0 }))
                      }
                      min={0}
                      className="w-20 bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                      aria-label={`Kiekis pirkti ${resourceNames[tipas as keyof typeof resourceNames]}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleBuy(tipas)}
                      className="bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                      disabled={!buyAmounts[tipas] || buyAmounts[tipas] <= 0}
                      aria-label={`Pirkti ${buyAmounts[tipas] || 0} ${resourceNames[tipas as keyof typeof resourceNames]}`}
                    >
                      Pirkti
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent
              value="pardavimas"
              className="space-y-4 mt-4"
              id="pardavimas-tab"
              role="tabpanel"
              aria-label="Pardavimo skirtukas"
            >
              {resourceTypes.map((tipas) => (
                <motion.div
                  key={tipas}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm border-yellow-300 dark:border-yellow-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getResourceIcon(tipas)}</div>
                    <div>
                      <div className="font-medium">{resourceNames[tipas as keyof typeof resourceNames]}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Pardavimo kaina: {RINKOS_KAINOS[tipas as keyof typeof RINKOS_KAINOS].pardavimo} 💰
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">Turima: {getResourceAmount(tipas)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={sellAmounts[tipas] || ""}
                      onChange={(e) =>
                        setSellAmounts((prev) => ({ ...prev, [tipas]: Number.parseInt(e.target.value) || 0 }))
                      }
                      min={0}
                      max={getResourceAmount(tipas)}
                      className="w-20 bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                      aria-label={`Kiekis parduoti ${resourceNames[tipas as keyof typeof resourceNames]}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSell(tipas)}
                      className="bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700"
                      disabled={
                        !sellAmounts[tipas] || sellAmounts[tipas] <= 0 || sellAmounts[tipas] > getResourceAmount(tipas)
                      }
                      aria-label={`Parduoti ${sellAmounts[tipas] || 0} ${resourceNames[tipas as keyof typeof resourceNames]}`}
                    >
                      Parduoti
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
