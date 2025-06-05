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
import { Store, Users, Trophy, LogOut } from "lucide-react"
import { UserMenu } from "@/components/game/user-menu"
import { authFunctions, dbFunctions } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import Image from "next/image"

export default function GamePage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams() // Get search params

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

      const isDemoModeRequested = searchParams.get("demo") === "true" // Check for demo query param

      if (isDemoModeRequested) {
        console.log("Demo mode requested via URL, initializing demo game.")
        initializeDemoGame()
        return
      }

      const hasSession = await authFunctions.hasActiveSession()

      if (!hasSession) {
        console.log("No active session found, using demo mode")
        initializeDemoGame()
        return
      }

      const { user } = await authFunctions.getCurrentUser()

      if (!user) {
        console.log("No authenticated user, using demo mode")
        initializeDemoGame()
        return
      }

      console.log("Authenticated user found:", user.id)
      setCurrentUser(user)

      const { data: ukisData, error: ukisError } = await dbFunctions.getUserFarm(user.id)

      if (ukisError) {
        console.error("Error getting farm:", ukisError)
        initializeDemoGame()
        return
      }

      if (!ukisData) {
        console.log("No farm found, creating a new one")
        const farmName = user.user_metadata?.ukio_pavadinimas || "Mano ūkis"
        const { data: newFarm, error: createError } = await dbFunctions.createFarm(user.id, farmName)

        if (createError || !newFarm) {
          console.error("Failed to create farm:", createError)
          initializeDemoGame()
          return
        }

        console.log("New farm created:", newFarm)
        await dbFunctions.createInitialResources(newFarm.id)
        await dbFunctions.createInitialBuildings(newFarm.id)
        setUkis(newFarm)

        const { data: newIstekliai } = await dbFunctions.supabase
          .from("istekliai")
          .select("*")
          .eq("ukio_id", newFarm.id)
        if (newIstekliai) setIstekliai(newIstekliai)

        const { data: newPastatai } = await dbFunctions.supabase.from("pastatai").select("*").eq("ukio_id", newFarm.id)
        if (newPastatai) setPastatai(newPastatai)

        setAugalai([])
        setGyvunai([])
        console.log("Game initialized with new farm")
        return
      }

      console.log("Farm found:", ukisData)
      setUkis(ukisData)

      const { data: istekliaiData } = await dbFunctions.supabase
        .from("istekliai")
        .select("*")
        .eq("ukio_id", ukisData.id)
      if (istekliaiData) setIstekliai(istekliaiData)

      const { data: pastataiData } = await dbFunctions.supabase.from("pastatai").select("*").eq("ukio_id", ukisData.id)
      if (pastataiData) setPastatai(pastataiData)

      const { data: augalaiData } = await dbFunctions.supabase.from("augalai").select("*").eq("ukio_id", ukisData.id)
      if (augalaiData) setAugalai(augalaiData)

      const { data: gyvunaiData } = await dbFunctions.supabase.from("gyvunai").select("*").eq("ukio_id", ukisData.id)
      if (gyvunaiData) setGyvunai(gyvunaiData)

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

    const pradiniaiIstekliai: Isteklius[] = [
      { id: "1", ukio_id: demoUkis.id, tipas: "grudai", kiekis: 50, atnaujinimo_data: new Date().toISOString() },
      { id: "2", ukio_id: demoUkis.id, tipas: "vaisiai", kiekis: 20, atnaujinimo_data: new Date().toISOString() },
      { id: "3", ukio_id: demoUkis.id, tipas: "pienas", kiekis: 10, atnaujinimo_data: new Date().toISOString() },
      { id: "4", ukio_id: demoUkis.id, tipas: "kiausiniai", kiekis: 15, atnaujinimo_data: new Date().toISOString() },
      { id: "5", ukio_id: demoUkis.id, tipas: "mesa", kiekis: 5, atnaujinimo_data: new Date().toISOString() },
    ]
    setIstekliai(pradiniaiIstekliai)

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

  const handleBuildingClick = (pastatas: Pastatas) => {
    setSelectedBuilding(pastatas)
    setShowBuildingDialog(true)
  }

  const handleEmptySlotClick = (x: number, y: number) => {
    setBuildPosition({ x, y })
    setShowBuildMenu(true)
  }

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

  const handleHarvestCrop = (augaloId: string) => {
    const augalas = augalai.find((a) => a.id === augaloId)
    if (!augalas || !ukis) return

    const augaloInfo = AUGALU_TIPAI[augalas.tipas as keyof typeof AUGALU_TIPAI]

    setAugalai((prev) => prev.filter((a) => a.id !== augaloId))

    setIstekliai((prev) =>
      prev.map((i) =>
        i.tipas === "grudai" || i.tipas === "vaisiai" ? { ...i, kiekis: i.kiekis + augaloInfo.pardavimo_kaina / 2 } : i,
      ),
    )

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

  const handleFeedAnimal = (gyvunoId: string) => {
    const gyvunas = gyvunai.find((g) => g.id === gyvunoId)
    if (!gyvunas) return

    const gyvunoInfo = GYVUNU_TIPAI[gyvunas.tipas as keyof typeof GYVUNU_TIPAI]

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

    setIstekliai((prev) =>
      prev.map((i) => (i.tipas === gyvunoInfo.produktas ? { ...i, kiekis: i.kiekis + gyvunoInfo.produkto_kiekis } : i)),
    )

    toast({
      title: "Gyvūnas pamaitintas!",
      description: `${gyvunas.vardas} pamaitintas ir davė ${gyvunoInfo.produkto_kiekis} ${gyvunoInfo.produktas}.`,
    })
  }

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

  const handleSignOut = () => {
    toast({
      title: "Atsijungta iš demo",
      description: "Grįžtate į pagrindinį meniu. 👋",
    })
    router.push("/")
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/placeholder.svg?height=1080&width=1920"
        alt="Linksmas ūkio peizažas"
        layout="fill"
        objectFit="cover"
        quality={90}
        className="-z-10"
        priority
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 -z-10" />

      {/* Header */}
      <header className="relative z-10 bg-yellow-600/80 dark:bg-yellow-700/80 border-b-4 border-yellow-800 dark:border-yellow-900 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">Didysis Ūkis</h1>
              <p className="text-yellow-50 text-sm">
                {ukis.pavadinimas} {isDemo && <span className="text-amber-200">(Demo)</span>}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMarketDialog(true)}
                className="bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
              >
                <Store className="h-4 w-4 mr-1" />
                Rinka
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
              >
                <Users className="h-4 w-4 mr-1" />
                Kaimynai
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Užduotys
              </Button>

              {ukis && !isDemo && <UserMenu lygis={ukis.lygis} patirtis={ukis.patirtis} />}
              {isDemo && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white border-2 border-red-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Atsijungti iš demo
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-0">
        {/* Išteklių juosta */}
        <ResourceBar istekliai={istekliai} pinigai={ukis.pinigai} patirtis={ukis.patirtis} lygis={ukis.lygis} />

        {/* Pagrindinis žaidimo laukas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ūkio tinklelis */}
          <div className="lg:col-span-3">
            <Card className="bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl">
              <CardHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
                <CardTitle className="font-heading text-2xl text-green-800 dark:text-green-200">Jūsų ūkis</CardTitle>
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
            <Card className="bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl">
              <CardHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
                <CardTitle className="font-heading text-xl text-green-800 dark:text-green-200">Statistikos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-green-900 dark:text-green-100 space-y-3">
                <div className="flex justify-between">
                  <span>Pastatai:</span>
                  <Badge variant="secondary" className="bg-lime-200 text-lime-800 dark:bg-lime-800 dark:text-lime-200">
                    {pastatai.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Augalai:</span>
                  <Badge variant="secondary" className="bg-lime-200 text-lime-800 dark:bg-lime-800 dark:text-lime-200">
                    {augalai.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Gyvūnai:</span>
                  <Badge variant="secondary" className="bg-lime-200 text-lime-800 dark:bg-lime-800 dark:text-lime-200">
                    {gyvunai.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ūkio vertė:</span>
                  <Badge variant="default" className="bg-amber-500 text-white dark:bg-amber-700 dark:text-amber-100">
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
            <Card className="bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl">
              <CardHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
                <CardTitle className="font-heading text-xl text-green-800 dark:text-green-200">
                  Greiti veiksmai
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md space-y-2">
                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                  onClick={() => setShowMarketDialog(true)}
                >
                  <Store className="h-4 w-4 mr-2" />
                  Atidaryti rinką
                </Button>

                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                  onClick={() => {
                    const paruostiAugalai = augalai.filter((a) => new Date() >= new Date(a.derliaus_data))
                    paruostiAugalai.forEach((a) => handleHarvestCrop(a.id))
                  }}
                  disabled={!augalai.some((a) => new Date() >= new Date(a.derliaus_data))}
                >
                  🌾 Nuimti visus derlius
                </Button>

                <Button
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white border-2 border-lime-800"
                  onClick={() => {
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
            <Card className="bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl">
              <CardHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
                <CardTitle className="font-heading text-xl text-green-800 dark:text-green-200">💡 Patarimai</CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-green-900 dark:text-green-100">
                <div className="text-sm space-y-2">
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
          <Card className="w-96 bg-yellow-50 dark:bg-gray-800 border-4 border-yellow-700 dark:border-yellow-900 shadow-xl">
            <CardHeader className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
              <CardTitle className="font-heading text-2xl text-green-800 dark:text-green-200">
                Pasirinkite pastatą
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {Object.entries(PASTATU_TIPAI).map(([key, pastatas]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="w-full justify-start bg-lime-100 hover:bg-lime-200 text-lime-800 border-2 border-lime-300 dark:bg-lime-900 dark:hover:bg-lime-800 dark:text-lime-100 dark:border-lime-700"
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
                className="w-full bg-red-500 hover:bg-red-600 text-white border-2 border-red-700"
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
