"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { motion } from "framer-motion"
import type { Isteklius } from "@/lib/supabase"
import { RINKOS_KAINOS } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"
import { Store, TrendingUp, TrendingDown } from "lucide-react"

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
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const getResourceAmount = (tipas: string) => {
    const isteklius = istekliai.find((i) => i.tipas === tipas)
    return isteklius?.kiekis || 0
  }

  const handleBuy = (tipas: string) => {
    const kiekis = quantities[`buy-${tipas}`] || 0
    if (kiekis <= 0) {
      toast({
        title: "Neteisingas kiekis",
        description: "Įveskite teisingą kiekį.",
        variant: "destructive",
      })
      return
    }

    const kaina = RINKOS_KAINOS[tipas as keyof typeof RINKOS_KAINOS].pirkimo * kiekis
    if (pinigai < kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${kaina} monetų.`,
        variant: "destructive",
      })
      return
    }

    onBuyResource(tipas, kiekis)
    setQuantities((prev) => ({ ...prev, [`buy-${tipas}`]: 0 }))
  }

  const handleSell = (tipas: string) => {
    const kiekis = quantities[`sell-${tipas}`] || 0
    if (kiekis <= 0) {
      toast({
        title: "Neteisingas kiekis",
        description: "Įveskite teisingą kiekį.",
        variant: "destructive",
      })
      return
    }

    const turimas = getResourceAmount(tipas)
    if (turimas < kiekis) {
      toast({
        title: "Nepakanka išteklių",
        description: `Turite tik ${turimas} vienetų.`,
        variant: "destructive",
      })
      return
    }

    onSellResource(tipas, kiekis)
    setQuantities((prev) => ({ ...prev, [`sell-${tipas}`]: 0 }))
  }

  const resourceNames = {
    grudai: "Grūdai",
    vaisiai: "Vaisiai",
    pienas: "Pienas",
    kiausiniai: "Kiaušiniai",
    mesa: "Mėsa",
  }

  const resourceIcons = {
    grudai: "🌾",
    vaisiai: "🍎",
    pienas: "🥛",
    kiausiniai: "🥚",
    mesa: "🥩",
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-amber-200 rounded-xl bg-white">
        <DialogHeader className="bg-gradient-to-r from-amber-500 to-amber-600 -mx-6 -mt-6 px-6 py-4 rounded-t-xl">
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <div className="p-1.5 bg-white rounded-full">
              <Store className="h-6 w-6 text-amber-600" />
            </div>
            Turgaus aikštė
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pirkti" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-50 rounded-full p-1 mt-2">
            <TabsTrigger
              value="pirkti"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 rounded-full"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Pirkti
            </TabsTrigger>
            <TabsTrigger
              value="parduoti"
              className="data-[state=active]:bg-white data-[state=active]:text-green-700 rounded-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Parduoti
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pirkti" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {Object.entries(RINKOS_KAINOS).map(([tipas, kainos], index) => (
                <motion.div
                  key={tipas}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-2 border-amber-200 rounded-xl">
                    <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-amber-100">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-amber-200">
                          <span className="text-2xl">{resourceIcons[tipas as keyof typeof resourceIcons]}</span>
                        </div>
                        {resourceNames[tipas as keyof typeof resourceNames]}
                        <span className="text-sm font-normal text-amber-600">({kainos.pirkimo} 💰 už vienetą)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 bg-white">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`buy-${tipas}`}>Kiekis:</Label>
                          <Input
                            id={`buy-${tipas}`}
                            type="number"
                            min="0"
                            value={quantities[`buy-${tipas}`] || ""}
                            onChange={(e) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [`buy-${tipas}`]: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                            className="bg-white border-2 border-amber-200 rounded-full"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <Button onClick={() => handleBuy(tipas)} className="farm-button">
                            Pirkti už{" "}
                            <AnimatedCounter
                              value={(quantities[`buy-${tipas}`] || 0) * kainos.pirkimo}
                              className="ml-1"
                            />{" "}
                            💰
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parduoti" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {Object.entries(RINKOS_KAINOS).map(([tipas, kainos], index) => {
                const turimas = getResourceAmount(tipas)

                return (
                  <motion.div
                    key={tipas}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-2 border-amber-200 rounded-xl">
                      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-green-100">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-200">
                            <span className="text-2xl">{resourceIcons[tipas as keyof typeof resourceIcons]}</span>
                          </div>
                          {resourceNames[tipas as keyof typeof resourceNames]}
                          <span className="text-sm font-normal text-green-600">({kainos.pardavimo} 💰 už vienetą)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4 bg-white">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="px-2 py-1 bg-amber-50 rounded-full border border-amber-200">
                            Turite: {turimas} vienetų
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`sell-${tipas}`}>Kiekis:</Label>
                            <Input
                              id={`sell-${tipas}`}
                              type="number"
                              min="0"
                              max={turimas}
                              value={quantities[`sell-${tipas}`] || ""}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [`sell-${tipas}`]: Math.min(Number.parseInt(e.target.value) || 0, turimas),
                                }))
                              }
                              placeholder="0"
                              className="bg-white border-2 border-amber-200 rounded-full"
                              disabled={turimas === 0}
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <Button
                              onClick={() => handleSell(tipas)}
                              className="farm-button farm-button-green"
                              disabled={turimas === 0 || !quantities[`sell-${tipas}`]}
                            >
                              Parduoti už{" "}
                              <AnimatedCounter
                                value={(quantities[`sell-${tipas}`] || 0) * kainos.pardavimo}
                                className="ml-1"
                              />{" "}
                              💰
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
