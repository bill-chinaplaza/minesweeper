interface CounterProps {
  value: number
  ariaLabel?: string
}

export default function Counter({ value, ariaLabel }: CounterProps) {
  const display = value.toString().padStart(3, '0')
  return (
    <div className="counter" aria-label={ariaLabel ?? `Counter ${display}`}>
      {display}
    </div>
  )
}
