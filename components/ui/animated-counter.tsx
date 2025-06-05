"use client"

import { useEffect, useRef, useState } from "react"
import { useSpring, animated } from "@react-spring/web"

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 500,
  formatValue = (val) => val.toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const [prevValue, setPrevValue] = useState(value)
  const firstRender = useRef(true)

  const { number } = useSpring({
    from: { number: prevValue },
    number: value,
    delay: firstRender.current ? 0 : 0,
    config: { duration: firstRender.current ? 0 : duration },
    onRest: () => {
      setPrevValue(value)
    },
  })

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
  }, [])

  return (
    <animated.span className={`font-semibold text-green-800 dark:text-green-200 ${className}`}>
      {number.to((val) => formatValue(Math.floor(val)))}
    </animated.span>
  )
}
