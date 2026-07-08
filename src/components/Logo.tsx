import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Orivo-Bildmarke: Planet mit Wellenlinien im Apium→Blue-Radiance-Verlauf
 * auf dunklem Oxford-Navy. Gespiegelt in public/favicon.svg.
 */
export function Logo({ className }: { className?: string }) {
  const id = useId()
  const gradientId = `${id}-gradient`
  const clipId = `${id}-clip`

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="15%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#D1E6C3" />
          <stop offset="100%" stopColor="#55CDED" />
        </linearGradient>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="25" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="15" fill="#081527" />
      <circle cx="32" cy="32" r="25" fill={`url(#${gradientId})`} />
      <g
        clipPath={`url(#${clipId})`}
        transform="rotate(-16 32 32)"
        fill="none"
        stroke="#081527"
        strokeWidth="3.4"
        strokeLinecap="round"
      >
        <path d="M0 14 Q 10 9 20 14 T 40 14 T 60 14 T 80 14" />
        <path d="M-4 24 Q 6 19 16 24 T 36 24 T 56 24 T 76 24" />
        <path d="M0 34 Q 10 29 20 34 T 40 34 T 60 34 T 80 34" />
        <path d="M-4 44 Q 6 39 16 44 T 36 44 T 56 44 T 76 44" />
        <path d="M0 54 Q 10 49 20 54 T 40 54 T 60 54 T 80 54" />
      </g>
    </svg>
  )
}
