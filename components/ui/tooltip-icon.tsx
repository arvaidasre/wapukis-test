"use client"

import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TooltipIconProps {
  icon: ReactNode
  content: ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function TooltipIcon({ icon, content, side = "top", className }: TooltipIconProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>{icon}</span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
