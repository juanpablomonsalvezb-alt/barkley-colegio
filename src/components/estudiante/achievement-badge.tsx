'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/formatters'

interface AchievementBadgeProps {
  title: string
  description: string
  iconUrl: string | null
  earnedAt?: string | null
  category: string
  xpReward: number
}

export function AchievementBadge({
  title,
  description,
  iconUrl,
  earnedAt,
  category,
  xpReward,
}: AchievementBadgeProps) {
  const isEarned = !!earnedAt

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isEarned
          ? 'hover:shadow-lg hover:-translate-y-0.5'
          : 'opacity-60 grayscale'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              isEarned
                ? 'bg-amber-100 text-amber-600'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt={title}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Trophy className="h-6 w-6" />
            )}
            {!isEarned && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-gray-200 p-0.5">
                <Lock className="h-3 w-3 text-gray-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                  isEarned
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {category}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                +{xpReward} XP
              </span>
            </div>
            {isEarned && earnedAt && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Obtenido el {formatDate(earnedAt)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
