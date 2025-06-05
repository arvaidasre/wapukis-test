import type React from "react"
import "@/app/globals.css"
import { Inter, Luckiest_Guy } from "next/font/google" // Pridedame Luckiest Guy šriftą
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider"
import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
})

export const metadata = {
  title: "Didysis Ūkis - Lietuviška ūkio simuliacija",
  description: "Išsami ūkio simuliacijos žaidimas lietuvių kalba su visomis BigFarm funkcijomis",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <body className={cn("font-sans", inter.variable, luckiestGuy.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AccessibilityProvider>
            {children}
            <Toaster />
            <AccessibilityMenu />
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
