"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  AccessibilityContext,
  defaultAccessibilityState,
  announce as announceToScreenReader,
  focusElement as focusHTMLElement,
  detectKeyboardNavigation,
} from "@/lib/accessibility"

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [state, setState] = useState(defaultAccessibilityState)
  const politeAnnouncerRef = useRef<HTMLDivElement>(null)
  const assertiveAnnouncerRef = useRef<HTMLDivElement>(null)

  // Aptikti klaviatūros navigaciją
  useEffect(() => {
    const cleanup = detectKeyboardNavigation()
    return cleanup
  }, [])

  // Patikrinti ar vartotojas naudoja ekrano skaitytuvą
  useEffect(() => {
    // Bandyti aptikti ekrano skaitytuvą
    const detectScreenReader = () => {
      // Kai kurie ekrano skaitytuvai prideda šias klases
      const axsPresent =
        document.documentElement.classList.contains("sr") ||
        document.documentElement.classList.contains("accessible") ||
        document.documentElement.classList.contains("screenreader")

      // Jei vartotojas paspaudė Tab mygtuką, gali būti, kad naudoja ekrano skaitytuvą
      const keyboardUser = document.body.classList.contains("keyboard-navigation")

      if (axsPresent || keyboardUser) {
        setState((prev) => ({ ...prev, screenReaderEnabled: true }))
      }
    }

    // Patikrinti po trumpo laiko, kad ekrano skaitytuvas spėtų užsikrauti
    const timer = setTimeout(detectScreenReader, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Pranešimų funkcija
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = priority === "assertive" ? assertiveAnnouncerRef.current : politeAnnouncerRef.current

    if (announcer) {
      // Išvalyti esamą turinį
      announcer.textContent = ""

      // Trumpas timeout, kad ekrano skaitytuvas aptiktų pakeitimą
      setTimeout(() => {
        announcer.textContent = message
      }, 50)
    }

    // Taip pat išsaugoti pranešimą bibliotekoje
    announceToScreenReader(message, priority)
  }

  // Elemento fokusavimo funkcija
  const focusElement = (selector: string) => {
    return focusHTMLElement(selector)
  }

  // Prieinamumo nustatymų perjungimo funkcijos
  const toggleScreenReader = () => {
    setState((prev) => ({ ...prev, screenReaderEnabled: !prev.screenReaderEnabled }))
  }

  const toggleHighContrast = () => {
    setState((prev) => {
      const newState = { ...prev, highContrast: !prev.highContrast }
      if (newState.highContrast) {
        document.documentElement.classList.add("high-contrast")
      } else {
        document.documentElement.classList.remove("high-contrast")
      }
      return newState
    })
  }

  const toggleLargeText = () => {
    setState((prev) => {
      const newState = { ...prev, largeText: !prev.largeText }
      if (newState.largeText) {
        document.documentElement.classList.add("large-text")
      } else {
        document.documentElement.classList.remove("large-text")
      }
      return newState
    })
  }

  const toggleAudioDescriptions = () => {
    setState((prev) => ({ ...prev, audioDescriptions: !prev.audioDescriptions }))
  }

  return (
    <AccessibilityContext.Provider
      value={{
        state,
        toggleScreenReader,
        toggleHighContrast,
        toggleLargeText,
        toggleAudioDescriptions,
        announce,
        focusElement,
      }}
    >
      {children}

      {/* Ekrano skaitytuvų pranešimų regionai */}
      <div
        ref={politeAnnouncerRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="polite-announcer"
      />
      <div
        ref={assertiveAnnouncerRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="assertive-announcer"
      />
    </AccessibilityContext.Provider>
  )
}
