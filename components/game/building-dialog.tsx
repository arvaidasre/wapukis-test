"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Pastatas, Augalas, Gyvunas } from "@/lib/supabase"
import { AUGALU_TIPAI, GYVUNU_TIPAI, PASTATU_TIPAI } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"

interface BuildingDialogProps {
  pastatas: Pastatas | null
  augalai: Augalas[]
  gyvunai: Gyvunas[]
  pinigai: number
  open: boolean
  onClose: () => void
  onPlantCrop: (pastatoId: string, augaloTipas: string) => void
  onHarvestCrop: (augaloId: string) => void
  onBuyAnimal: (pastatoId: string, gyvunoTipas: string, vardas: string) => void
  onFeedAnimal: (gyvunoId: string) => void
  onUpgradeBuilding: (pastatoId: string) => void
}

export function BuildingDialog({
  pastatas,
  augalai,
  gyvunai,
  pinigai,
  open,
  onClose,
  onPlantCrop,
  onHarvestCrop,
  onBuyAnimal,
  onFeedAnimal,
  onUpgradeBuilding,
}: BuildingDialogProps) {
  const { toast } = useToast()
  const [selectedCrop, setSelectedCrop] = useState("")
  const [selectedAnimal, setSelectedAnimal] = useState("")
  const [animalName, setAnimalName] = useState("")

  if (!pastatas) return null

  const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]
  const laukoAugalai = augalai.filter((a) => a.lauko_id === pastatas.id)
  const tvartoGyvunai = gyvunai.filter((g) => g.tvarto_id === pastatas.id)

  const handlePlantCrop = () => {
    if (!selectedCrop) {
      toast({
        title: "Pasirinkite augalą",
        description: "Prašome pasirinkti, ką norite sodinti.",
        variant: "destructive",
      })
      return
    }

    const augaloTipas = AUGALU_TIPAI[selectedCrop as keyof typeof AUGALU_TIPAI]
    if (pinigai < augaloTipas.kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${augaloTipas.kaina} monetų.`,
        variant: "destructive",
      })
      return
    }

    onPlantCrop(pastatas.id, selectedCrop)
    setSelectedCrop("")
  }

  const handleBuyAnimal = () => {
    if (!selectedAnimal) {
      toast({
        title: "Pasirinkite gyvūną",
        description: "Prašome pasirinkti, kokį gyvūną norite pirkti.",
        variant: "destructive",
      })
      return
    }

    const gyvunoTipas = GYVUNU_TIPAI[selectedAnimal as keyof typeof GYVUNU_TIPAI]
    if (pinigai < gyvunoTipas.kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${gyvunoTipas.kaina} monetų.`,
        variant: "destructive",
      })
      return
    }

    const maxTalpa = PASTATU_TIPAI.tvartas.talpa(pastatas.lygis)
    if (tvartoGyvunai.length >= maxTalpa) {
      toast({
        title: "Tvartas pilnas",
        description: "Atnaujinkite tvartą arba parduokite gyvūnus.",
        variant: "destructive",
      })
      return
    }

    onBuyAnimal(pastatas.id, selectedAnimal, animalName || gyvunoTipas.pavadinimas)
    setSelectedAnimal("")
    setAnimalName("")
  }

  const handleUpgrade = () => {
    const kaina = pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)
    if (pinigai < kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${kaina} monetų.`,
        variant: "destructive",
      })
      return
    }

    onUpgradeBuilding(pastatas.id)
  }

  const isHarvestReady = (augalas: Augalas) => {
    return new Date() >= new Date(augalas.derliaus_data)
  }

  const canFeedAnimal = (gyvunas: Gyvunas) => {
    const gyvunoTipas = GYVUNU_TIPAI[gyvunas.tipas as keyof typeof GYVUNU_TIPAI]
    const paskutinisMaisinimas = new Date(gyvunas.paskutinis_maisinimas)
    const dabar = new Date()
    const praejusLaikas = (dabar.getTime() - paskutinisMaisinimas.getTime()) / 1000

    return praejusLaikas >= gyvunoTipas.maisinimo_intervalas
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{pastatoTipas?.ikona}</span>
            {pastatoTipas?.pavadinimas}
            <Badge variant="secondary">Lygis {pastatas.lygis}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="veiksmai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="veiksmai">Veiksmai</TabsTrigger>
            <TabsTrigger value="atnaujinimas">Atnaujinimas</TabsTrigger>
          </TabsList>

          <TabsContent value="veiksmai" className="space-y-4">
            {pastatas.tipas === "laukas" && (
              <div className="space-y-4">
                {laukoAugalai.length === 0 ? (
                  <div className="space-y-3">
                    <Label>Pasirinkite augalą sodinimui:</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pasirinkite augalą" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AUGALU_TIPAI).map(([key, augalas]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{augalas.ikona}</span>
                              <span>{augalas.pavadinimas}</span>
                              <span className="text-sm text-gray-500">({augalas.kaina}💰)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handlePlantCrop} className="w-full">
                      Sodinti
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {laukoAugalai.map((augalas) => {
                      const augaloTipas = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]
                      const paruostas = isHarvestReady(augalas)

                      return (
                        <div key={augalas.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{augaloTipas.ikona}</span>
                            <div>
                              <div className="font-medium">{augaloTipas.pavadinimas}</div>
                              <div className="text-sm text-gray-500">{paruostas ? "Paruošta derliui!" : "Auga..."}</div>
                            </div>
                          </div>
                          {paruostas && (
                            <Button size="sm" onClick={() => onHarvestCrop(augalas.id)}>
                              Nuimti derlių
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {pastatas.tipas === "tvartas" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Pirkti gyvūną:</Label>
                  <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite gyvūną" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GYVUNU_TIPAI).map(([key, gyvunas]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{gyvunas.ikona}</span>
                            <span>{gyvunas.pavadinimas}</span>
                            <span className="text-sm text-gray-500">({gyvunas.kaina}💰)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label htmlFor="animal-name">Gyvūno vardas (neprivaloma):</Label>
                    <Input
                      id="animal-name"
                      value={animalName}
                      onChange={(e) => setAnimalName(e.target.value)}
                      placeholder="Įveskite vardą"
                    />
                  </div>

                  <Button onClick={handleBuyAnimal} className="w-full">
                    Pirkti gyvūną
                  </Button>
                </div>

                {tvartoGyvunai.length > 0 && (
                  <div className="space-y-3">
                    <Label>
                      Tvartas ({tvartoGyvunai.length}/{PASTATU_TIPAI.tvartas.talpa(pastatas.lygis)}):
                    </Label>
                    {tvartoGyvunai.map((gyvunas) => {
                      const gyvunoTipas = GYVUNU_TIPAI[gyvunas.tipas as keyof typeof GYVUNU_TIPAI]
                      const galimaMaitinti = canFeedAnimal(gyvunas)

                      return (
                        <div key={gyvunas.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{gyvunoTipas.ikona}</span>
                            <div>
                              <div className="font-medium">{gyvunas.vardas}</div>
                              <div className="text-sm text-gray-500">
                                Sveikata: {gyvunas.sveikata}% | Laimingumas: {gyvunas.laimingumas}%
                              </div>
                            </div>
                          </div>
                          {galimaMaitinti && (
                            <Button size="sm" onClick={() => onFeedAnimal(gyvunas.id)}>
                              Maitinti
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="atnaujinimas" className="space-y-4">
            <div className="text-center space-y-3">
              <div className="text-lg font-semibold">Atnaujinti iki {pastatas.lygis + 1} lygio</div>
              <div className="text-2xl font-bold text-green-600">
                {pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)} 💰
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                {pastatas.tipas === "tvartas" && (
                  <div>Talpa: {PASTATU_TIPAI.tvartas.talpa(pastatas.lygis + 1)} gyvūnų</div>
                )}
                {pastatas.tipas === "sandelis" && (
                  <div>Talpa: {PASTATU_TIPAI.sandelis.talpa(pastatas.lygis + 1)} vienetų</div>
                )}
                <div>Padidės efektyvumas ir pajamos</div>
              </div>

              <Button
                onClick={handleUpgrade}
                className="w-full"
                disabled={pinigai < pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)}
              >
                Atnaujinti pastatą
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
