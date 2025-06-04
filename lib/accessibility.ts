"use client"

import { createContext, useContext } from "react"

// Prieinamumo būsenos tipas
export interface AccessibilityState {
  screenReaderEnabled: boolean
  highContrast: boolean
  largeText: boolean
  audioDescriptions: boolean
  keyboardNavigationActive: boolean
  focusVisible: boolean
}

// Prieinamumo konteksto tipas
export interface AccessibilityContextType {
  state: AccessibilityState
  toggleScreenReader: () => void
  toggleHighContrast: () => void
  toggleLargeText: () => void
  toggleAudioDescriptions: () => void
  announce: (message: string, priority?: "polite" | "assertive") => void
  focusElement: (selector: string) => void
}

// Numatytoji prieinamumo būsena
export const defaultAccessibilityState: AccessibilityState = {
  screenReaderEnabled: false,
  highContrast: false,
  largeText: false,
  audioDescriptions: false,
  keyboardNavigationActive: false,
  focusVisible: true,
}

// Sukuriame kontekstą
export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

// Hook'as prieinamumo funkcijoms naudoti
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

// Pranešimų eilė ekrano skaitytuvui
let announcements: { id: number; message: string; priority: "polite" | "assertive" }[] = []
let announcementCounter = 0

// Funkcija pranešimams ekrano skaitytuvui
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const id = announcementCounter++
  announcements.push({ id, message, priority })

  // Išvalyti pranešimą po 10 sekundžių
  setTimeout(() => {
    announcements = announcements.filter((a) => a.id !== id)
  }, 10000)

  return id
}

// Funkcija elementui sufokusuoti
export function focusElement(selector: string) {
  try {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      return true
    }
  } catch (error) {
    console.error("Failed to focus element:", error)
  }
  return false
}

// Klaviatūros navigacijos aptikimas
export function detectKeyboardNavigation() {
  let usingKeyboard = false

  const handleKeyDown = () => {
    if (!usingKeyboard) {
      usingKeyboard = true
      document.body.classList.add("keyboard-navigation")
    }
  }

  const handleMouseDown = () => {
    if (usingKeyboard) {
      usingKeyboard = false
      document.body.classList.remove("keyboard-navigation")
    }
  }

  // Pridėti event listener'ius
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleMouseDown)

    // Išvalyti event listener'ius
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }

  return () => {}
}

// Funkcija žaidimo elementų aprašymams
export function getGameElementDescription(elementType: string, data: any): string {
  switch (elementType) {
    case "pastatas":
      return `${
        data.tipas === "laukas"
          ? "Laukas"
          : data.tipas === "tvartas"
            ? "Tvartas"
            : data.tipas === "namas"
              ? "Namas"
              : data.tipas === "sandelis"
                ? "Sandėlis"
                : data.tipas
      }, 
              ${data.lygis} lygio, pozicija ${data.pozicija_x + 1}, ${data.pozicija_y + 1}.`

    case "augalas":
      const augalas =
        data.tipas === "kvieciai"
          ? "Kviečiai"
          : data.tipas === "kukuruzai"
            ? "Kukurūzai"
            : data.tipas === "pomidorai"
              ? "Pomidorai"
              : data.tipas === "morka"
                ? "Morkos"
                : data.tipas

      const derliausData = new Date(data.derliaus_data)
      const dabar = new Date()
      const paruostas = dabar >= derliausData

      return `${augalas}, ${paruostas ? "paruošta derliui" : "dar auga"}.`

    case "gyvunas":
      const gyvunas =
        data.tipas === "karve"
          ? "Karvė"
          : data.tipas === "vista"
            ? "Višta"
            : data.tipas === "kiaule"
              ? "Kiaulė"
              : data.tipas

      return `${gyvunas}, ${data.vardas ? `vardu ${data.vardas}` : "be vardo"}, 
              sveikata: ${data.sveikata}%, 
              laimingumas: ${data.laimingumas}%.`

    case "isteklius":
      const isteklius =
        data.tipas === "grudai"
          ? "Grūdai"
          : data.tipas === "vaisiai"
            ? "Vaisiai"
            : data.tipas === "pienas"
              ? "Pienas"
              : data.tipas === "kiausiniai"
                ? "Kiaušiniai"
                : data.tipas === "mesa"
                  ? "Mėsa"
                  : data.tipas

      return `${isteklius}: ${data.kiekis} vienetų.`

    default:
      return "Nežinomas elementas."
  }
}
