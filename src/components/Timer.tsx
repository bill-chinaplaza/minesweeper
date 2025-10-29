import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../lib/utils'

interface TimerProps {
  running: boolean
  resetKey: number
  onTick?: (seconds: number) => void
}

export default function Timer({ running, resetKey, onTick }: TimerProps) {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // reset when resetKey changes
    setSeconds(0)
  }, [resetKey])

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const ns = s + 1
          onTick?.(ns)
          return ns
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running, onTick])

  return <div className="counter" aria-label={`Time ${formatTime(seconds)}`}>{formatTime(seconds)}</div>
}
