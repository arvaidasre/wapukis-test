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

  useEffect(() => {
    const cleanup = detectKeyboardNavigation()
    return cleanup
  }, [])

  useEffect(() => {
    const detectScreenReader = () => {
      const axsPresent =
        document.documentElement.classList.contains("sr") ||
        document.documentElement.classList.contains("accessible") ||
        document.documentElement.classList.contains("screenreader")

      const keyboardUser = document.body.classList.contains("keyboard-navigation")

      if (axsPresent || keyboardUser) {
        setState((prev) => ({ ...prev, screenReaderEnabled: true }))
      }
    }

    const timer = setTimeout(detectScreenReader, 1000)

    return () => clearTimeout(timer)
  }, [])

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = priority === "assertive" ? assertiveAnnouncerRef.current : politeAnnouncerRef.current

    if (announcer) {
      announcer.textContent = ""

      setTimeout(() => {
        announcer.textContent = message
      }, 50)
    }

    announceToScreenReader(message, priority)
  }

  const focusElement = (selector: string) => {
    return focusHTMLElement(selector)
  }

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
