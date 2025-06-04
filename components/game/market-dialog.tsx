"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Isteklius } from "@/lib/supabase"
import { RINKOS_KAINOS } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            Rinka
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pirkti" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pirkti">Pirkti</TabsTrigger>
            <TabsTrigger value="parduoti">Parduoti</TabsTrigger>
          </TabsList>

          <TabsContent value="pirkti" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(RINKOS_KAINOS).map(([tipas, kainos]) => (
                <Card key={tipas}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">{resourceIcons[tipas as keyof typeof resourceIcons]}</span>
                      {resourceNames[tipas as keyof typeof resourceNames]}
                      <span className="text-sm font-normal text-gray-500">({kainos.pirkimo} 💰 už vienetą)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <Button onClick={() => handleBuy(tipas)}>
                          Pirkti už {(quantities[`buy-${tipas}`] || 0) * kainos.pirkimo} 💰
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parduoti" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(RINKOS_KAINOS).map(([tipas, kainos]) => {
                const turimas = getResourceAmount(tipas)

                return (
                  <Card key={tipas}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-xl">{resourceIcons[tipas as keyof typeof resourceIcons]}</span>
                        {resourceNames[tipas as keyof typeof resourceNames]}
                        <span className="text-sm font-normal text-gray-500">({kainos.pardavimo} 💰 už vienetą)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600">Turite: {turimas} vienetų</div>
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
                                [`sell-${tipas}`]: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <Button onClick={() => handleSell(tipas)} disabled={turimas === 0}>
                            Parduoti už {(quantities[`sell-${tipas}`] || 0) * kainos.pardavimo} 💰
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [`sell-${tipas}`]: Math.floor(turimas / 2),
                            }))
                          }
                          disabled={turimas === 0}
                        >
                          Pusė
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [`sell-${tipas}`]: turimas,
                            }))
                          }
                          disabled={turimas === 0}
                        >
                          Visus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
