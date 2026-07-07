import { type ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  className?: string
  'aria-label'?: string
}

/** Schlanker Range-Slider im shadcn-Look. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  className,
  ...aria
}: SliderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value))
  }

  const percent = ((value - min) / (max - min)) * 100

  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
      className={cn(
        'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary',
        '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow',
        className,
      )}
      style={{
        background: `linear-gradient(to right, hsl(var(--primary)) ${percent}%, hsl(var(--secondary)) ${percent}%)`,
      }}
      {...aria}
    />
  )
}
