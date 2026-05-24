'use client'

import { Progress } from '@/components/ui/progress'
import { Zap } from 'lucide-react'

interface XpBarProps {
  totalXp: number
}

interface LevelProgress {
  currentLevel: number
  currentLevelXp: number
  nextLevelXp: number
  progressPercent: number
}

function getLevelProgress(totalXp: number): LevelProgress {
  // Each level requires progressively more XP
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-500, etc.
  const levels = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000]

  let currentLevel = 1
  for (let i = 1; i < levels.length; i++) {
    if (totalXp >= levels[i]) {
      currentLevel = i + 1
    } else {
      break
    }
  }

  const currentLevelXp = levels[Math.min(currentLevel - 1, levels.length - 1)] || 0
  const nextLevelXp = levels[Math.min(currentLevel, levels.length - 1)] || levels[levels.length - 1] + 1000
  const progressPercent = nextLevelXp > currentLevelXp
    ? ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    : 100

  return { currentLevel, currentLevelXp, nextLevelXp, progressPercent }
}

export function XpBar({ totalXp }: XpBarProps) {
  const { currentLevel, currentLevelXp, nextLevelXp, progressPercent } = getLevelProgress(totalXp)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold">Nivel {currentLevel}</span>
        </div>
        <span className="text-muted-foreground text-xs">
          {totalXp - currentLevelXp} / {nextLevelXp - currentLevelXp} XP
        </span>
      </div>
      <Progress value={progressPercent} className="h-2" />
    </div>
  )
}
