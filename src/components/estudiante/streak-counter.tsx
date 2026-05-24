'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  className?: string
}

export function StreakCounter({ currentStreak, longestStreak, className }: StreakCounterProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        currentStreak > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
      )}>
        <Flame className={cn('h-4 w-4', currentStreak > 0 && 'fill-orange-500 text-orange-500')} />
        <span className="font-bold text-sm">{currentStreak}</span>
        <span className="text-xs">dias</span>
      </div>
      {longestStreak > currentStreak && (
        <span className="text-xs text-muted-foreground">
          Mejor: {longestStreak}
        </span>
      )}
    </div>
  )
}
