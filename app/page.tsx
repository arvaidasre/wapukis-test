"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FarmGrid } from "@/components/game/farm-grid"
import { ResourceBar } from "@/components/game/resource-bar"
import { BuildingDialog } from "@/components/game/building-dialog"
import { MarketDialog } from "@/components/game/market-dialog"
import type { Ukis, Isteklius, Pastatas, Augalas, Gyvunas } from "@/lib/supabase"
import { AUGALU_TIPAI, GYVUNU_TIPAI, PASTATU_TIPAI, RINKOS_KAINOS } from "@/lib/game-data"
import { useToast } from "@/components/ui/use-toast"
import { Store, Users, Trophy } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { UserMenu } from "@/components/game/user-menu"
import { authFunctions, dbFunctions } from "@/lib/supabase"

export default function DidysisUkis() {
  return (
    <AuthGuard>
      <DidysisUkisContent />
    </AuthGuard>
  )
}

function DidysisUkisContent() {
  const { toast } = useToast()

  // Žaidimo būsena
  const [ukis, setUkis] = useState<Ukis | null>(null)
  const [istekliai, setIstekliai] = useState<Isteklius[]>([])
  const [pastatai, setPastatai] = useState<Pastatas[]>([])
  const [augalai, setAugalai] = useState<Augalas[]>([])
  const [gyvunai, setGyvunai] = useState<Gyvunas[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isDemo, setIsDemo] = useState(false)

  // UI būsena
  const [selectedBuilding, setSelectedBuilding] = useState<Pastatas | null>(null)
  const [showBuildingDialog, setShowBuildingDialog] = useState(false)
  const [showMarketDialog, setShowMarketDialog] = useState(false)
  const [showBuildMenu, setShowBuildMenu] = useState(false)
  const [buildPosition, setBuildPosition] = useState<{ x: number; y: number } | null>(null)

  // Inicializuoti žaidimą
  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = async () => {
    try {
      console.log("Initializing game...")

      // Bandyti gauti dabartinį vartotoją
      const { user, error } = await authFunctions.getCurrentUser()

      if (error || !user) {
        console.log("No authenticated user, using demo mode")
        initializeDemoGame()
        return
      }

      console.log("Authenticated user found:", user.id)
      setCurrentUser(user)

      // Gauti vartotojo ūkį
      const { data: ukisData, error: ukisError } = await dbFunctions.getUserFarm(user.id)

      if (ukisError || !ukisData) {
        console.log("No farm found, using demo mode")
        initializeDemoGame()
        return
      }

      console.log("Farm found:", ukisData)
      setUkis(ukisData)

      // Gauti išteklius
      const { data: istekliaiData } = await dbFunctions.supabase
        .from("istekliai")
        .select("*")
        .eq("ukio_id", ukisData.id)

      if (istekliaiData) {
        setIstekliai(istekliaiData)
      }

      // Gauti pastatus
      const { data: pastataiData } = await dbFunctions.supabase.from("pastatai").select("*").eq("ukio_id", ukisData.id)

      if (pastataiData) {
        setPastatai(pastataiData)
      }

      // Gauti augalus
      const { data: augalaiData } = await dbFunctions.supabase.from("augalai").select("*").eq("ukio_id", ukisData.id)

      if (augalaiData) {
        setAugalai(augalaiData)
      }

      // Gauti gyvūnus
      const { data: gyvunaiData } = await dbFunctions.supabase.from("gyvunai").select("*").eq("ukio_id", ukisData.id)

      if (gyvunaiData) {
        setGyvunai(gyvunaiData)
      }

      console.log("Game initialized successfully with database")
    } catch (error) {
      console.error("Game initialization error:", error)
      console.log("Falling back to demo mode")
      initializeDemoGame()
    }
  }

  const initializeDemoGame = () => {
    console.log("Initializing demo game...")
    setIsDemo(true)

    // Sukurti demo ūkį
    const demoUkis: Ukis = {
      id: "demo-ukis",
      vartotojo_id: "demo-user",
      pavadinimas: "Demo Ūkis",
      lygis: 1,
      pinigai: 1000,
      patirtis: 0,
      sukurimo_data: new Date().toISOString(),
    }

    setUkis(demoUkis)

    // Pradiniai ištekliai
    const pradiniaiIstekliai: Isteklius[] = [
      { id: "1", ukio_id: demoUkis.id, tipas: "grudai", kiekis: 50, atnaujinimo_data: new Date().toISOString() },
      { id: "2", ukio_id: demoUkis.id, tipas: "vaisiai", kiekis: 20, atnaujinimo_data: new Date().toISOString() },
      { id: "3", ukio_id: demoUkis.id, tipas: "pienas", kiekis: 10, atnaujinimo_data: new Date().toISOString() },
      { id: "4", ukio_id: demoUkis.id, tipas: "kiausiniai", kiekis: 15, atnaujinimo_data: new Date().toISOString() },
      { id: "5", ukio_id: demoUkis.id, tipas: "mesa", kiekis: 5, atnaujinimo_data: new Date().toISOString() },
    ]

    setIstekliai(pradiniaiIstekliai)

    // Pradiniai pastatai
    const pradiniaiPastatai: Pastatas[] = [
      {
        id: "pastatas-1",
        ukio_id: demoUkis.id,
        tipas: "laukas",
        lygis: 1,
        pozicija_x: 0,
        pozicija_y: 0,
        busena: "laisvas",
        sukurimo_data: new Date().toISOString(),
      },
      {
        id: "pastatas-2",
        ukio_id: demoUkis.id,
        tipas: "tvartas",
        lygis: 1,
        pozicija_x: 1,
        pozicija_y: 0,
        busena: "laisvas",
        sukurimo_data: new Date().toISOString(),
      },
    ]

    setPastatai(pradiniaiPastatai)
    setAugalai([])
    setGyvunai([])

    console.log("Demo game initialized successfully")

    toast({
      title: "Demo režimas",
      description: "Žaidžiate demo režimu. Duomenys nebus išsaugoti.",
    })
  }

  // Pastato paspaudimas
  const handleBuildingClick = (pastatas: Pastatas) => {
    setSelectedBuilding(pastatas)
    setShowBuildingDialog(true)
  }

  // Tuščios vietos paspaudimas
  const handleEmptySlotClick = (x: number, y: number) => {
    setBuildPosition({ x, y })
    setShowBuildMenu(true)
  }

  // Pastato statymas
  const handleBuildBuilding = (tipas: string) => {
    if (!buildPosition || !ukis) return

    const pastatoTipas = PASTATU_TIPAI[tipas as keyof typeof PASTATU_TIPAI]
    if (ukis.pinigai < pastatoTipas.kaina) {
      toast({
        title: "Nepakanka pinigų",
        description: `Reikia ${pastatoTipas.kaina} monetų.`,
        variant: "destructive",
      })
      return
    }

    const naujasPastatas: Pastatas = {
      id: `pastatas-${Date.now()}`,
      ukio_id: ukis.id,
      tipas,
      lygis: 1,
      pozicija_x: buildPosition.x,
      pozicija_y: buildPosition.y,
      busena: "laisvas",
      sukurimo_data: new Date().toISOString(),
    }

    setPastatai((prev) => [...prev, naujasPastatas])
    setUkis((prev) => (prev ? { ...prev, pinigai: prev.pinigai - pastatoTipas.kaina } : null))
    setShowBuildMenu(false)
    setBuildPosition(null)

    toast({
      title: "Pastatas pastatytas!",
      description: `${pastatoTipas.pavadinimas} sėkmingai pastatytas.`,
    })
  }

  // Augalo sodinimas
  const handlePlantCrop = (pastatoId: string, augaloTipas: string) => {
    if (!ukis) return

    const augaloInfo = AUGALU_TIPAI[augaloTipas as keyof typeof AUGALU_TIPAI]
    const sodinimo_data = new Date()
    const derliaus_data = new Date(sodinimo_data.getTime() + augaloInfo.augimo_laikas * 1000)

    const naujasAugalas: Augalas = {
      id: `augalas-${Date.now()}`,
      ukio_id: ukis.id,
      lauko_id: pastatoId,
      tipas: augaloTipas,
      sodinimo_data: sodinimo_data.toISOString(),
      derliaus_data: derliaus_data.toISOString(),
      busena: "auga",
    }

    setAugalai((prev) => [...prev, naujasAugalas])
    setUkis((prev) => (prev ? { ...prev, pinigai: prev.pinigai - augaloInfo.kaina } : null))

    toast({
      title: "Augalas pasodintas!",
      description: `${augaloInfo.pavadinimas} pasodintas. Derlius bus po ${augaloInfo.augimo_laikas} sekundžių.`,
    })
  }

  // Derliaus nuėmimas
  const handleHarvestCrop = (augaloId: string) => {
    const augalas = augalai.find((a) => a.id === augaloId)
    if (!augalas || !ukis) return

    const augaloInfo = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]

    // Pašalinti augalą
    setAugalai((prev) => prev.filter((a) => a.id !== augaloId))

    // Pridėti išteklius
    setIstekliai((prev) =>
      prev.map((i) =>
        i.tipas === "grudai" || i.tipas === "vaisiai" ? { ...i, kiekis: i.kiekis + augaloInfo.pardavimo_kaina / 2 } : i,
      ),
    )

    // Pridėti patirtį
    setUkis((prev) =>
      prev
        ? {
            ...prev,
            patirtis: prev.patirtis + augaloInfo.patirtis,
            lygis: Math.floor((prev.patirtis + augaloInfo.patirtis) / 100) + 1,
          }
        : null,
    )

    toast({
      title: "Derlius nuimtas!",
      description: `Gavote ${augaloInfo.pavadinimas} ir ${augaloInfo.patirtis} patirties taškų.`,
    })
  }

  // Gyvūno pirkimas
  const handleBuyAnimal = (pastatoId: string, gyvunoTipas: string, vardas: string) => {
    if (!ukis) return

    const gyvunoInfo = GYVUNU_TIPAI[gyvunoTipas as keyof typeof GYVUNU_TIPAI]

    const naujasGyvunas: Gyvunas = {
      id: `gyvunas-${Date.now()}`,
      ukio_id: ukis.id,
      tvarto_id: pastatoId,
      tipas: gyvunoTipas,
      vardas,
      amzius: 0,
      sveikata: 100,
      laimingumas: 100,
      paskutinis_maisinimas: new Date().toISOString(),
      sukurimo_data: new Date().toISOString(),
    }

    setGyvunai((prev) => [...prev, naujasGyvunas])
    setUkis((prev) => (prev ? { ...prev, pinigai: prev.pinigai - gyvunoInfo.kaina } : null))

    toast({
      title: "Gyvūnas nupirktas!",
      description: `${vardas} (${gyvunoInfo.pavadinimas}) pridėtas į tvartą.`,
    })
  }

  // Gyvūno maitinimas
  const handleFeedAnimal = (gyvunoId: string) => {
    const gyvunas = gyvunai.find((g) => g.id === gyvunoId)
    if (!gyvunas) return

    const gyvunoInfo = GYVUNU_TIPAI[gyvunas.tipas as keyof typeof GYVUNU_TIPAI]

    // Atnaujinti gyvūną
    setGyvunai((prev) =>
      prev.map((g) =>
        g.id === gyvunoId
          ? {
              ...g,
              paskutinis_maisinimas: new Date().toISOString(),
              sveikata: Math.min(100, g.sveikata + 10),
              laimingumas: Math.min(100, g.laimingumas + 15),
            }
          : g,
      ),
    )

    // Pridėti produktą
    setIstekliai((prev) =>
      prev.map((i) => (i.tipas === gyvunoInfo.produktas ? { ...i, kiekis: i.kiekis + gyvunoInfo.produkto_kiekis } : i)),
    )

    toast({
      title: "Gyvūnas pamaitintas!",
      description: `${gyvunas.vardas} pamaitintas ir davė ${gyvunoInfo.produkto_kiekis} ${gyvunoInfo.produktas}.`,
    })
  }

  // Pastato atnaujinimas
  const handleUpgradeBuilding = (pastatoId: string) => {
    const pastatas = pastatai.find((p) => p.id === pastatoId)
    if (!pastatas || !ukis) return

    const pastatoTipas = PASTATU_TIPAI[pastatas.tipas as keyof typeof PASTATU_TIPAI]
    const kaina = pastatoTipas.atnaujinimo_kaina(pastatas.lygis)

    setPastatai((prev) => prev.map((p) => (p.id === pastatoId ? { ...p, lygis: p.lygis + 1 } : p)))

    setUkis((prev) => (prev ? { ...prev, pinigai: prev.pinigai - kaina } : null))

    toast({
      title: "Pastatas atnaujintas!",
      description: `${pastatoTipas.pavadinimas} atnaujintas iki ${pastatas.lygis + 1} lygio.`,
    })
  }

  // Išteklių pirkimas
  const handleBuyResource = (tipas: string, kiekis: number) => {
    if (!ukis) return

    const kaina = RINKOS_KAINOS[tipas as keyof typeof RINKOS_KAINOS].pirkimo * kiekis

    setUkis((prev) => (prev ? { ...prev, pinigai: prev.pinigai - kaina } : null))
    setIstekliai((prev) => prev.map((i) => (i.tipas === tipas ? { ...i, kiekis: i.kiekis + kiekis } : i)))

    toast({
      title: "Ištekliai nupirkti!",
      description: `Nupirkote ${kiekis} ${tipas} už ${kaina} monetų.`,
    })
  }

  // Išteklių pardavimas
  const handleSellResource = (tipas: string, kiekis: number) => {
    if (!ukis) return

    const pajamos = RINKOS_KAINOS[tipas as keyof typeof RINKOS_KAINOS].pardavimo * kiekis

    setUkis((prev) => (prev ? { ...prev, pinigai: prev.pinigai + pajamos } : null))
    setIstekliai((prev) => prev.map((i) => (i.tipas === tipas ? { ...i, kiekis: i.kiekis - kiekis } : i)))

    toast({
      title: "Ištekliai parduoti!",
      description: `Pardavėte ${kiekis} ${tipas} už ${pajamos} monetų.`,
    })
  }

  if (!ukis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Kraunama...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">Ruošiamas jūsų ūkis...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200">
      {/* Antraštė */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-green-800">Didysis Ūkis</h1>
              <p className="text-green-600">
                {ukis.pavadinimas} {isDemo && <span className="text-amber-600">(Demo)</span>}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMarketDialog(true)}>
                <Store className="h-4 w-4 mr-1" />
                Rinka
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Kaimynai
              </Button>
              <Button variant="outline" size="sm">
                <Trophy className="h-4 w-4 mr-1" />
                Užduotys
              </Button>

              {/* Pridėti vartotojo meniu tik jei ne demo */}
              {ukis && !isDemo && <UserMenu lygis={ukis.lygis} patirtis={ukis.patirtis} />}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Išteklių juosta */}
        <ResourceBar istekliai={istekliai} pinigai={ukis.pinigai} patirtis={ukis.patirtis} lygis={ukis.lygis} />

        {/* Pagrindinis žaidimo laukas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ūkio tinklelis */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Jūsų ūkis</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <FarmGrid
                  pastatai={pastatai}
                  augalai={augalai}
                  gyvunai={gyvunai}
                  onBuildingClick={handleBuildingClick}
                  onEmptySlotClick={handleEmptySlotClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Šoninis meniu */}
          <div className="space-y-4">
            {/* Statistikos kortelė */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistikos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Pastatai:</span>
                  <Badge variant="secondary">{pastatai.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Augalai:</span>
                  <Badge variant="secondary">{augalai.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Gyvūnai:</span>
                  <Badge variant="secondary">{gyvunai.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ūkio vertė:</span>
                  <Badge variant="default">
                    {(
                      ukis.pinigai +
                      istekliai.reduce(
                        (sum, i) =>
                          sum + (RINKOS_KAINOS[i.tipas as keyof typeof RINKOS_KAINOS]?.pardavimo || 0) * i.kiekis,
                        0,
                      )
                    ).toLocaleString()}{" "}
                    💰
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Greiti veiksmai */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Greiti veiksmai</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setShowMarketDialog(true)}>
                  <Store className="h-4 w-4 mr-2" />
                  Atidaryti rinką
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    // Automatiškai nuimti visus paruoštus derlius
                    const paruostiAugalai = augalai.filter((a) => new Date() >= new Date(a.derliaus_data))
                    paruostiAugalai.forEach((a) => handleHarvestCrop(a.id))
                  }}
                  disabled={!augalai.some((a) => new Date() >= new Date(a.derliaus_data))}
                >
                  🌾 Nuimti visus derlius
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    // Automatiškai maitinti visus gyvūnus
                    gyvunai.forEach((g) => {
                      const gyvunoInfo = GYVUNU_TIPAI[g.tipas as keyof typeof GYVUNU_TIPAI]
                      const paskutinisMaisinimas = new Date(g.paskutinis_maisinimas)
                      const dabar = new Date()
                      const praejusLaikas = (dabar.getTime() - paskutinisMaisinimas.getTime()) / 1000

                      if (praejusLaikas >= gyvunoInfo.maisinimo_intervalas) {
                        handleFeedAnimal(g.id)
                      }
                    })
                  }}
                  disabled={
                    !gyvunai.some((g) => {
                      const gyvunoInfo = GYVUNU_TIPAI[g.tipas as keyof typeof GYVUNU_TIPAI]
                      const paskutinisMaisinimas = new Date(g.paskutinis_maisinimas)
                      const dabar = new Date()
                      const praejusLaikas = (dabar.getTime() - paskutinisMaisinimas.getTime()) / 1000
                      return praejusLaikas >= gyvunoInfo.maisinimo_intervalas
                    })
                  }
                >
                  🐄 Maitinti gyvūnus
                </Button>
              </CardContent>
            </Card>

            {/* Patarimai */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Patarimai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2 text-gray-600">
                  <p>• Reguliariai maitinkite gyvūnus, kad gautumėte daugiau produktų</p>
                  <p>• Atnaujinkite pastatus, kad padidintumėte efektyvumą</p>
                  <p>• Stebėkite rinkos kainas prieš parduodami išteklius</p>
                  <p>• Sodinkite įvairius augalus, kad diversifikuotumėte pajamas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pastatų statymo meniu */}
      {showBuildMenu && buildPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Pasirinkite pastatą</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(PASTATU_TIPAI).map(([key, pastatas]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleBuildBuilding(key)}
                  disabled={ukis.pinigai < pastatas.kaina}
                >
                  <span className="text-xl mr-3">{pastatas.ikona}</span>
                  <div className="text-left">
                    <div>{pastatas.pavadinimas}</div>
                    <div className="text-sm text-gray-500">{pastatas.kaina} 💰</div>
                  </div>
                </Button>
              ))}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setShowBuildMenu(false)
                  setBuildPosition(null)
                }}
              >
                Atšaukti
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogo langai */}
      <BuildingDialog
        pastatas={selectedBuilding}
        augalai={augalai}
        gyvunai={gyvunai}
        pinigai={ukis.pinigai}
        open={showBuildingDialog}
        onClose={() => {
          setShowBuildingDialog(false)
          setSelectedBuilding(null)
        }}
        onPlantCrop={handlePlantCrop}
        onHarvestCrop={handleHarvestCrop}
        onBuyAnimal={handleBuyAnimal}
        onFeedAnimal={handleFeedAnimal}
        onUpgradeBuilding={handleUpgradeBuilding}
      />

      <MarketDialog
        open={showMarketDialog}
        onClose={() => setShowMarketDialog(false)}
        istekliai={istekliai}
        pinigai={ukis.pinigai}
        onBuyResource={handleBuyResource}
        onSellResource={handleSellResource}
      />
    </div>
  )
}
