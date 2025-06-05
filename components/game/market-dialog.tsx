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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-yellow-50 dark:bg-gray-800 border-4 border-yellow-700 dark:border-yellow-900 shadow-xl">
        <DialogHeader className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
          <DialogTitle className="flex items-center gap-2 text-xl font-heading text-green-800 dark:text-green-200">
            <div className="p-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-full">
              <Store className="h-6 w-6 text-amber-600" />
            </div>
            Rinka
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pirkti" className="w-full p-4">
          <TabsList className="grid w-full grid-cols-2 bg-lime-100/50 dark:bg-lime-900/20 border border-lime-300 dark:border-lime-700">
            <TabsTrigger
              value="pirkti"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 text-lime-800 dark:text-lime-200"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Pirkti
            </TabsTrigger>
            <TabsTrigger
              value="parduoti"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 text-lime-800 dark:text-lime-200"
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
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700">
                    <CardHeader className="pb-3 bg-yellow-100 dark:bg-yellow-900/50">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
                        <span className="text-2xl">{resourceIcons[tipas as keyof typeof resourceIcons]}</span>
                        {resourceNames[tipas as keyof typeof resourceNames]}
                        <span className="text-sm font-normal text-amber-600 dark:text-amber-400">
                          ({kainos.pirkimo} 💰 už vienetą)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 text-green-900 dark:text-green-100">
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
                            className="bg-white dark:bg-gray-900 border border-yellow-300 dark:border-yellow-700"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <Button
                            onClick={() => handleBuy(tipas)}
                            className="bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700"
                          >
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
                    <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700">
                      <CardHeader className="pb-3 bg-yellow-100 dark:bg-yellow-900/50">
                        <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
                          <span className="text-2xl">{resourceIcons[tipas as keyof typeof resourceIcons]}</span>
                          {resourceNames[tipas as keyof typeof resourceNames]}
                          <span className="text-sm font-normal text-lime-600 dark:text-lime-400">
                            ({kainos.pardavimo} 💰 už vienetą)
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 p-4 text-green-900 dark:text-green-100">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Turite: {turimas} vienetų</div>
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
                              className="bg-white dark:bg-gray-900 border border-yellow-300 dark:border-yellow-700"
                              disabled={turimas === 0}
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <Button
                              onClick={() => handleSell(tipas)}
                              className="bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
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
