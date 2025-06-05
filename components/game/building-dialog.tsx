"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useAccessibility } from "@/lib/accessibility"
import { motion, AnimatePresence } from "framer-motion"
import type { Pastatas, Augalas, Gyvunas } from "@/lib/supabase"
import { AUGALU_TIPAI, GYVUNU_TIPAI, PASTATU_TIPAI } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"
import { ArrowUpCircle, Leaf, Tractor, Warehouse, Home } from "lucide-react"

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
  const { state, announce } = useAccessibility()
  const [selectedCrop, setSelectedCrop] = useState("")
  const [selectedAnimal, setSelectedAnimal] = useState("")
  const [animalName, setAnimalName] = useState("")
  const [activeTab, setActiveTab] = useState("veiksmai")

  useEffect(() => {
    if (open && pastatas && state.screenReaderEnabled) {
      const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]

      let message = `${pastatoTipas?.pavadinimas} valdymas. ${pastatas.lygis} lygio.`

      if (pastatas.tipas === "laukas") {
        const laukoAugalai = augalai.filter((a) => a.lauko_id === pastatas.id)
        if (laukoAugalai.length > 0) {
          const augalas = laukoAugalai[0]
          const augaloTipas = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]
          const paruostas = new Date() >= new Date(augalas.derliaus_data)
          message += ` Auga ${augaloTipas?.pavadinimas}, ${paruostas ? "paruošta derliui" : "dar auga"}.`
        } else {
          message += " Laukas tuščias, galite sodinti augalus."
        }
      } else if (pastatas.tipas === "tvartas") {
        const tvartoGyvunai = gyvunai.filter((g) => g.tvarto_id === pastatas.id)
        if (tvartoGyvunai.length > 0) {
          message += ` Tvarte yra ${tvartoGyvunai.length} gyvūnai.`
        } else {
          message += " Tvartas tuščias, galite pirkti gyvūnus."
        }
      }

      announce(message)
    }
  }, [open, pastatas, augalai, gyvunai, state.screenReaderEnabled, announce])

  useEffect(() => {
    if (open && state.screenReaderEnabled) {
      announce(`Pasirinktas ${activeTab === "veiksmai" ? "veiksmų" : "atnaujinimo"} skirtukas`)
    }
  }, [activeTab, open, state.screenReaderEnabled, announce])

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
      if (state.screenReaderEnabled) {
        announce("Klaida: Nepasirinktas augalas", "assertive")
      }
      return
    }

    const augaloTipas = AUGALU_TIPAI[selectedCrop as keyof typeof AUGALU_TIPAI]
    if (pinigai < augaloTipas.kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${augaloTipas.kaina} monetų.`,
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce(`Klaida: Nepakanka pinigų. Reikia ${augaloTipas.kaina} monetų.`, "assertive")
      }
      return
    }

    onPlantCrop(pastatas.id, selectedCrop)
    setSelectedCrop("")

    if (state.screenReaderEnabled) {
      announce(`${augaloTipas.pavadinimas} sėkmingai pasodintas.`)
    }
  }

  const handleBuyAnimal = () => {
    if (!selectedAnimal) {
      toast({
        title: "Pasirinkite gyvūną",
        description: "Prašome pasirinkti, kokį gyvūną norite pirkti.",
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce("Klaida: Nepasirinktas gyvūnas", "assertive")
      }
      return
    }

    const gyvunoTipas = GYVUNU_TIPAI[selectedAnimal as keyof typeof GYVUNU_TIPAI]
    if (pinigai < gyvunoTipas.kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${gyvunoTipas.kaina} monetų.`,
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce(`Klaida: Nepakanka pinigų. Reikia ${gyvunoTipas.kaina} monetų.`, "assertive")
      }
      return
    }

    const maxTalpa = PASTATU_TIPAI.tvartas.talpa(pastatas.lygis)
    if (tvartoGyvunai.length >= maxTalpa) {
      toast({
        title: "Tvartas pilnas",
        description: "Atnaujinkite tvartą arba parduokite gyvūnus.",
        variant: "destructive",
      })
      if (state.screenReaderEnabled) {
        announce("Klaida: Tvartas pilnas. Atnaujinkite tvartą arba parduokite gyvūnus.", "assertive")
      }
      return
    }

    onBuyAnimal(pastatas.id, selectedAnimal, animalName || gyvunoTipas.pavadinimas)
    setSelectedAnimal("")
    setAnimalName("")

    if (state.screenReaderEnabled) {
      announce(`${gyvunoTipas.pavadinimas} sėkmingai nupirktas.`)
    }
  }

  const handleUpgrade = () => {
    const kaina = pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)
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

    onUpgradeBuilding(pastatas.id)

    if (state.screenReaderEnabled) {
      announce(`${pastatoTipas?.pavadinimas} sėkmingai atnaujintas iki ${pastatas.lygis + 1} lygio.`)
    }
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

  const getBuildingIcon = () => {
    switch (pastatas.tipas) {
      case "laukas":
        return <Leaf className="h-6 w-6 text-green-500" />
      case "tvartas":
        return <Warehouse className="h-6 w-6 text-amber-600" />
      case "namas":
        return <Home className="h-6 w-6 text-blue-500" />
      case "sandelis":
        return <Warehouse className="h-6 w-6 text-gray-500" />
      default:
        return <Tractor className="h-6 w-6 text-green-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl"
        aria-labelledby="building-dialog-title"
      >
        <DialogHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
          <DialogTitle
            id="building-dialog-title"
            className="flex items-center gap-2 text-xl font-heading text-green-800 dark:text-green-200"
          >
            <div className="p-1.5 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-full border border-yellow-300 dark:border-yellow-700">
              {getBuildingIcon()}
            </div>
            <div className="flex items-center gap-2">
              {pastatoTipas?.pavadinimas}
              <Badge
                variant="secondary"
                className="bg-lime-200 text-lime-800 dark:bg-lime-800 dark:text-lime-200 border border-lime-300 dark:border-lime-700"
              >
                Lygis {pastatas.lygis}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="veiksmai"
          className="w-full"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-2 bg-yellow-100/50 dark:bg-yellow-900/20 border-2 border-yellow-700 dark:border-yellow-800 rounded-lg">
            <TabsTrigger
              value="veiksmai"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
              aria-controls="veiksmai-tab"
            >
              Veiksmai
            </TabsTrigger>
            <TabsTrigger
              value="atnaujinimas"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-700 data-[state=active]:font-semibold dark:data-[state=active]:bg-amber-700 dark:data-[state=active]:border-amber-900 text-green-800 dark:text-green-200"
              aria-controls="atnaujinimas-tab"
            >
              Atnaujinimas
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="veiksmai"
            className="space-y-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-green-900 dark:text-green-100"
            id="veiksmai-tab"
            role="tabpanel"
            aria-label="Veiksmų skirtukas"
          >
            {pastatas.tipas === "laukas" && (
              <div className="space-y-4">
                {laukoAugalai.length === 0 ? (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="crop-select">Pasirinkite augalą sodinimui:</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop} aria-label="Augalo pasirinkimas">
                      <SelectTrigger
                        id="crop-select"
                        className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                      >
                        <SelectValue placeholder="Pasirinkite augalą" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 text-green-900 dark:text-green-100">
                        {Object.entries(AUGALU_TIPAI).map(([key, augalas]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            aria-label={`${augalas.pavadinimas}, kaina: ${augalas.kaina} monetų`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{augalas.ikona}</span>
                              <span>{augalas.pavadinimas}</span>
                              <span className="text-sm text-gray-500">({augalas.kaina}💰)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handlePlantCrop}
                      className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                      aria-label="Sodinti pasirinktą augalą"
                    >
                      Sodinti
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence>
                      {laukoAugalai.map((augalas) => {
                        const augaloTipas = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]
                        const paruostas = isHarvestReady(augalas)

                        return (
                          <motion.div
                            key={augalas.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm border-yellow-300 dark:border-yellow-700"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{augaloTipas.ikona}</div>
                              <div>
                                <div className="font-medium">{augaloTipas.pavadinimas}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {paruostas ? "Paruošta derliui!" : "Auga..."}
                                </div>
                              </div>
                            </div>
                            {paruostas && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  onHarvestCrop(augalas.id)
                                  if (state.screenReaderEnabled) {
                                    announce(`${augaloTipas.pavadinimas} derlius sėkmingai nuimtas.`)
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700"
                                aria-label={`Nuimti ${augaloTipas.pavadinimas} derlių`}
                              >
                                Nuimti derlių
                              </Button>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            )}

            {pastatas.tipas === "tvartas" && (
              <div className="space-y-4">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="animal-select">Pirkti gyvūną:</Label>
                  <Select value={selectedAnimal} onValueChange={setSelectedAnimal} aria-label="Gyvūno pasirinkimas">
                    <SelectTrigger
                      id="animal-select"
                      className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                    >
                      <SelectValue placeholder="Pasirinkite gyvūną" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 text-green-900 dark:text-green-100">
                      {Object.entries(GYVUNU_TIPAI).map(([key, gyvunas]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          aria-label={`${gyvunas.pavadinimas}, kaina: ${gyvunas.kaina} monetų`}
                        >
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
                      className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                      aria-label="Gyvūno vardas"
                    />
                  </div>

                  <Button
                    onClick={handleBuyAnimal}
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                    aria-label="Pirkti pasirinktą gyvūną"
                  >
                    Pirkti gyvūną
                  </Button>
                </motion.div>

                {tvartoGyvunai.length > 0 && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label>
                      Tvartas ({tvartoGyvunai.length}/{PASTATU_TIPAI.tvartas.talpa(pastatas.lygis)}):
                    </Label>
                    <AnimatePresence>
                      {tvartoGyvunai.map((gyvunas) => {
                        const gyvunoTipas = GYVUNU_TIPAI[gyvunas.tipas as keyof typeof GYVUNU_TIPAI]
                        const galimaMaitinti = canFeedAnimal(gyvunas)

                        return (
                          <motion.div
                            key={gyvunas.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm border-yellow-300 dark:border-yellow-700"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{gyvunoTipas.ikona}</div>
                              <div>
                                <div className="font-medium">{gyvunas.vardas}</div>
                                <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span>❤️ {gyvunas.sveikata}%</span>
                                  <span>😊 {gyvunas.laimingumas}%</span>
                                </div>
                              </div>
                            </div>
                            {galimaMaitinti && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  onFeedAnimal(gyvunas.id)
                                  if (state.screenReaderEnabled) {
                                    announce(`${gyvunas.vardas} sėkmingai pamaitintas.`)
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700"
                                aria-label={`Maitinti ${gyvunas.vardas}`}
                              >
                                Maitinti
                              </Button>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="atnaujinimas"
            className="space-y-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-green-900 dark:text-green-100"
            id="atnaujinimas-tab"
            role="tabpanel"
            aria-label="Atnaujinimo skirtukas"
          >
            <motion.div
              className="text-center space-y-5 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-lg font-semibold">Atnaujinti iki {pastatas.lygis + 1} lygio</div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowUpCircle className="h-12 w-12 text-amber-500 animate-pulse" />
                </div>
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-yellow-100/50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 flex items-center justify-center text-3xl">
                    {pastatoTipas?.ikona}
                  </div>
                </div>
              </div>

              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">
                <AnimatedCounter value={pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)} /> 💰
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {pastatas.tipas === "tvartas" && (
                  <div>
                    Talpa: {PASTATU_TIPAI.tvartas.talpa(pastatas.lygis)} →{" "}
                    {PASTATU_TIPAI.tvartas.talpa(pastatas.lygis + 1)} gyvūnų
                  </div>
                )}
                {pastatas.tipas === "sandelis" && (
                  <div>
                    Talpa: {PASTATU_TIPAI.sandelis.talpa(pastatas.lygis)} →{" "}
                    {PASTATU_TIPAI.sandelis.talpa(pastatas.lygis + 1)} vienetų
                  </div>
                )}
                <div>Padidės efektyvumas ir pajamos</div>
              </div>

              <Button
                onClick={handleUpgrade}
                className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                disabled={pinigai < pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)}
                aria-label={`Atnaujinti ${pastatoTipas?.pavadinimas} už ${pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)} monetų`}
              >
                Atnaujinti pastatą
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
