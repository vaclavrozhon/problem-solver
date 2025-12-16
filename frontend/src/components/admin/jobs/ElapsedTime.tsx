import { useState, useEffect } from "react"

export function ElapsedTime({ started_at }: { started_at: number }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - started_at)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - started_at)
    }, 1000)
    return () => clearInterval(interval)
  }, [started_at])

  return format_duration(elapsed)
}

export function format_duration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours} h ${minutes % 60} m ${seconds % 60} s`
  if (minutes > 0) return `${minutes} m ${seconds % 60} s`
  return `${seconds} s`
}
