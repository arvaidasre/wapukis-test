"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAccessibility } from "@/lib/accessibility"
import { Accessibility, Eye, Volume2, Keyboard, Type } from "lucide-react"

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false)
  const { state, toggleScreenReader, toggleHighContrast, toggleLargeText, toggleAudioDescriptions, announce } =
    useAccessibility()

  const handleToggleScreenReader = () => {
    toggleScreenReader()
    announce(
      state.screenReaderEnabled ? "Ekrano skaitytuvo režimas išjungtas" : "Ekrano skaitytuvo režimas įjungtas",
      "assertive",
    )
  }

  const handleToggleHighContrast = () => {
    toggleHighContrast()
    announce(state.highContrast ? "Didelio kontrasto režimas išjungtas" : "Didelio kontrasto režimas įjungtas")
  }

  const handleToggleLargeText = () => {
    toggleLargeText()
    announce(state.largeText ? "Didelio teksto režimas išjungtas" : "Didelio teksto režimas įjungtas")
  }

  const handleToggleAudioDescriptions = () => {
    toggleAudioDescriptions()
    announce(state.audioDescriptions ? "Garsiniai aprašymai išjungti" : "Garsiniai aprašymai įjungti")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 shadow-lg"
          aria-label="Prieinamumo nustatymai"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-yellow-600/80 dark:bg-yellow-700/80 border-4 border-yellow-800 dark:border-yellow-900 shadow-2xl backdrop-blur-sm p-2 rounded-xl">
        <DialogHeader className="bg-yellow-50 dark:bg-yellow-800/30 p-4 rounded-t-md border-b-2 border-yellow-700 dark:border-yellow-800">
          <DialogTitle className="text-center text-xl font-heading text-green-800 dark:text-green-200">
            Prieinamumo nustatymai
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md text-green-900 dark:text-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <Label htmlFor="screen-reader-mode">Ekrano skaitytuvo režimas</Label>
            </div>
            <Switch
              id="screen-reader-mode"
              checked={state.screenReaderEnabled}
              onCheckedChange={handleToggleScreenReader}
              className="data-[state=checked]:bg-lime-500 data-[state=unchecked]:bg-gray-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <Label htmlFor="high-contrast">Didelis kontrastas</Label>
            </div>
            <Switch
              id="high-contrast"
              checked={state.highContrast}
              onCheckedChange={handleToggleHighContrast}
              className="data-[state=checked]:bg-lime-500 data-[state=unchecked]:bg-gray-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <Label htmlFor="large-text">Didelis tekstas</Label>
            </div>
            <Switch
              id="large-text"
              checked={state.largeText}
              onCheckedChange={handleToggleLargeText}
              className="data-[state=checked]:bg-lime-500 data-[state=unchecked]:bg-gray-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              <Label htmlFor="audio-descriptions">Garsiniai aprašymai</Label>
            </div>
            <Switch
              id="audio-descriptions"
              checked={state.audioDescriptions}
              onCheckedChange={handleToggleAudioDescriptions}
              className="data-[state=checked]:bg-lime-500 data-[state=unchecked]:bg-gray-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              <Label>Klaviatūros navigacija</Label>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Naudokite Tab, Shift+Tab, Enter ir rodyklių mygtukus
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 p-4 bg-yellow-50 dark:bg-yellow-800/30 rounded-b-md">
          <p>
            Šie nustatymai padės jums naudotis žaidimu su ekrano skaitytuvais ir kitomis pagalbinėmis technologijomis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
