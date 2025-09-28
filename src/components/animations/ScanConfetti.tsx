"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

interface ScanConfettiProps {
  trigger: boolean
  durationMs?: number
}

export function ScanConfetti({ trigger, durationMs = 2500 }: ScanConfettiProps) {
  const [hasFired, setHasFired] = useState(false)

  useEffect(() => {
    if (!trigger || hasFired) return

    setHasFired(true)

    const end = Date.now() + durationMs

    const tick = () => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8465CB", "#a478e8", "#ffffff"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(tick)
      }
    }

    tick()
  }, [trigger, hasFired, durationMs])

  return null
}

export default ScanConfetti

