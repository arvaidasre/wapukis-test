"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
          className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12"
          aria-label="Prieinamumo nustatymai"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Prieinamumo nustatymai</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <Label htmlFor="screen-reader-mode">Ekrano skaitytuvo režimas</Label>
            </div>
            <Switch
              id="screen-reader-mode"
              checked={state.screenReaderEnabled}
              onCheckedChange={handleToggleScreenReader}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <Label htmlFor="high-contrast">Didelis kontrastas</Label>
            </div>
            <Switch id="high-contrast" checked={state.highContrast} onCheckedChange={handleToggleHighContrast} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <Label htmlFor="large-text">Didelis tekstas</Label>
            </div>
            <Switch id="large-text" checked={state.largeText} onCheckedChange={handleToggleLargeText} />
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
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              <Label>Klaviatūros navigacija</Label>
            </div>
            <div className="text-sm text-gray-500">Naudokite Tab, Shift+Tab, Enter ir rodyklių mygtukus</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            Šie nustatymai padės jums naudotis žaidimu su ekrano skaitytuvais ir kitomis pagalbinėmis technologijomis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
