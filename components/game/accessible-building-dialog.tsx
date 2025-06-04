"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAccessibility } from "@/lib/accessibility"
import { motion, AnimatePresence } from "framer-motion"
import type { Pastatas, Augalas, Gyvunas } from "@/lib/supabase"
import { AUGALU_TIPAI, GYVUNU_TIPAI, PASTATU_TIPAI } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"
import { Leaf, Tractor, Warehouse, Home } from "lucide-react"

interface AccessibleBuildingDialogProps {
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

export function AccessibleBuildingDialog({
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
}: AccessibleBuildingDialogProps) {
  const { toast } = useToast()
  const { state, announce } = useAccessibility()
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState('')
  const [animalName, setAnimalName] = useState('')
  const [activeTab, setActiveTab] = useState('veiksmai')

  // Pranešti apie dialogo atidarymą
  useEffect(() => {
    if (open && pastatas && state.screenReaderEnabled) {
      const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]
      
      let message = `${pastatoTipas?.pavadinimas} valdymas. ${pastatas.lygis} lygio.`
      
      if (pastatas.tipas === 'laukas') {
        const laukoAugalai = augalai.filter(a => a.lauko_id === pastatas.id)
        if (laukoAugalai.length > 0) {
          const augalas = laukoAugalai[0]
          const augaloTipas = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]
          const paruostas = new Date() >= new Date(augalas.derliaus_data)
          message += ` Auga ${augaloTipas?.pavadinimas}, ${paruostas ? 'paruošta derliui' : 'dar auga'}.`
        } else {
          message += ' Laukas tuščias, galite sodinti augalus.'
        }
      } else if (pastatas.tipas === 'tvartas') {
        const tvartoGyvunai = gyvunai.filter(g => g.tvarto_id === pastatas.id)
        if (tvartoGyvunai.length > 0) {
          message += ` Tvarte yra ${tvartoGyvunai.length} gyvūnai.`
        } else {
          message += ' Tvartas tuščias, galite pirkti gyvūnus.'
        }
      }
      
      announce(message)
    }
  }, [open, pastatas, augalai, gyvunai, state.screenReaderEnabled, announce])
  
  // Pranešti apie tabo pakeitimą
  useEffect(() => {
    if (open && state.screenReaderEnabled) {
      announce(`Pasirinktas ${activeTab === 'veiksmai' ? 'veiksmų' : 'atnaujinimo'} skirtukas`)
    }
  }, [activeTab, open, state.screenReaderEnabled, announce])

  if (!pastatas) return null

  const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]
  const laukoAugalai = augalai.filter((a) => a.lauko_id === pastatas.id)
  const tvartoGyvunai = gyvunai.filter((g) => g.tvarto_id === pastatas.id)

  const handlePlantCrop = () => {
    if (!selectedCrop) {
      toast({
        title: 'Pasirinkite augalą',
        description: 'Prašome pasirinkti, ką norite sodinti.',
        variant: 'destructive',
      })
      if (state.screenReaderEnabled) {
        announce('Klaida: Nepasirinktas augalas', 'assertive')
      }
      return
    }

    const augaloTipas = AUGALU_TIPAI[selectedCrop as keyof typeof AUGALU_TIPAI]
    if (pinigai < augaloTipas.kaina) {
      toast({
        title: 'Nepakanka pinigų',
        description: `Reikia ${augaloTipas.kaina} monetų.`,
        variant: 'destructive',
      })
      if (state.screenReaderEnabled) {
        announce(`Klaida: Nepakanka pinigų. Reikia ${augaloTipas.kaina} monetų.`, 'assertive')
      }
      return
    }

    onPlantCrop(pastatas.id, selectedCrop)
    setSelectedCrop('')
    
    if (state.screenReaderEnabled) {
      announce(`${augaloTipas.pavadinimas} sėkmingai pasodintas.`)
    }
  }

  const handleBuyAnimal = () => {
    if (!selectedAnimal) {
      toast({
        title: 'Pasirinkite gyvūną',
        description: 'Prašome pasirinkti, kokį gyvūną norite pirkti.',
        variant: 'destructive',
      })
      if (state.screenReaderEnabled) {
        announce('Klaida: Nepasirinktas gyvūnas', 'assertive')
      }
      return
    }

    const gyvunoTipas = GYVUNU_TIPAI[selectedAnimal as keyof typeof GYVUNU_TIPAI]
    if (pinigai < gyvunoTipas.kaina) {
      toast({
        title: 'Nepakanka pinigų',
        description: `Reikia ${gyvunoTipas.kaina} monetų.`,
        variant: 'destructive',
      })
      if (state.screenReaderEnabled) {
        announce(`Klaida: Nepakanka pinigų. Reikia ${gyvunoTipas.kaina} monetų.`, 'assertive')
      }
      return
    }

    const maxTalpa = PASTATU_TIPAI.tvartas.talpa(pastatas.lygis)
    if (tvartoGyvunai.length >= maxTalpa) {
      toast({
        title: 'Tvartas pilnas',
        description: 'Atnaujinkite tvartą arba parduokite gyvūnus.',
        variant: 'destructive',
      })
      if (state.screenReaderEnabled) {
        announce('Klaida: Tvartas pilnas. Atnaujinkite tvartą arba parduokite gyvūnus.', 'assertive')
      }
      return
    }

    onBuyAnimal(pastatas.id, selectedAnimal, animalName || gyvunoTipas.pavadinimas)
    setSelectedAnimal('')
    setAnimalName('')
    
    if (state.screenReaderEnabled) {
      announce(`${gyvunoTipas.pavadinimas} sėkmingai nupirktas.`)
    }
  }

  const handleUpgrade = () => {
    const kaina = pastatoTipas?.atnaujinimo_kaina(pastatas.lygis)
    if (pinigai < kaina) {
      toast({
        title: 'Nepakanka pinigų',
        description: `Reikia ${kaina} monetų.`,
        variant: 'destructive',
      })
      if (state.screenReaderEnabled) {
        announce(`Klaida: Nepakanka pinigų. Reikia ${kaina} monetų.`, 'assertive')
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
      case 'laukas':
        return <Leaf className="h-6 w-6 text-green-500" />
      case 'tvartas':
        return <Warehouse className="h-6 w-6 text-amber-600" />
      case 'namas':
        return <Home className="h-6 w-6 text-blue-500" />
      case 'sandelis':
        return <Warehouse className="h-6 w-6 text-gray-500" />
      default:
        return <Tractor className="h-6 w-6 text-green-500" />
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onClose}
    >
      <DialogContent 
        className="max-w-md bg-gradient-to-b from-white to-green-50 dark:from-gray-950 dark:to-green-950 border-none shadow-xl"
        aria-labelledby="building-dialog-title"
      >
        <DialogHeader>
          <DialogTitle 
            id="building-dialog-title" 
            className="flex items-center gap-2 text-xl"
          >
            <div className="p-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full">
              {getBuildingIcon()}
            </div>
            <div className="flex items-center gap-2">
              {pastatoTipas?.pavadinimas}
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900"
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
          <TabsList className="grid w-full grid-cols-2 bg-green-100/50 dark:bg-green-900/20">
            <TabsTrigger 
              value="veiksmai" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              aria-controls="veiksmai-tab"
            >
              Veiksmai
            </TabsTrigger>
            <TabsTrigger
              value="atnaujinimas"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              aria-controls="atnaujinimas-tab"
            >
              Atnaujinimas
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="veiksmai" 
            className="space-y-4 mt-4"
            id="veiksmai-tab"
            role="tabpanel"
            aria-label="Veiksmų skirtukas"
          >
            {pastatas.tipas === 'laukas' && (
              <div className="space-y-4">
                {laukoAugalai.length === 0 ? (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="crop-select">Pasirinkite augalą sodinimui:</Label>
                    <Select 
                      value={selectedCrop} 
                      onValueChange={setSelectedCrop}
                      aria-label="Augalo pasirinkimas"
                    >
                      <SelectTrigger 
                        id="crop-select" 
                        className="bg-white dark:bg-gray-800"
                      >
                        <SelectValue placeholder="Pasirinkite augalą" />
                      </SelectTrigger>
                      <SelectContent>
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
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
                            className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{augaloTipas.ikona}</div>
                              <div>
                                <div className="font-medium">{augaloTipas.pavadinimas}</div>
                                <div className="text-sm text-gray-500">
                                  {paruostas ? 'Paruošta derliui!' : 'Auga...'}
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
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
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

            {pastatas.tipas === 'tvartas' && (
              <div className="space-y-4">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="animal-select">Pirkti gyvūną:</Label>
                  <Select 
                    value={selectedAnimal} 
                    onValueChange={setSelectedAnimal}
                    aria-label="Gyvūno pasirinkimas"
                  >
                    <SelectTrigger 
                      id="animal-select" 
                      className="bg-white dark:bg-gray-800"
                    >
                      <SelectValue placeholder="Pasirinkite gyvūną" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GYVUNU_TIPAI).map(([key, gyvunas]) => (
                        <SelectItem 
                          key={key} 
                          value={key}
                          aria-label={`${gyvunas.pavadinimas}, kaina: ${gyvunas.kaina} monetų`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{gyvunas.ikona}</span>
                            <span>{gyvunas.pavadinimas}</span>\
