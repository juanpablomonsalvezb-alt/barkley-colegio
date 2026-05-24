'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCountdownReturn {
  timeLeft: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  formattedTime: string
}

export function useCountdown(
  totalSeconds: number,
  onComplete: () => void
): UseCountdownReturn {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(() => {
    setIsRunning(false)
    clearTimer()
    setTimeLeft(totalSeconds)
  }, [totalSeconds, clearTimer])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          onCompleteRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isRunning, clearTimer])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return { timeLeft, isRunning, start, pause, reset, formattedTime }
}
