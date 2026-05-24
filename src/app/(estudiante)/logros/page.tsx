import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AchievementBadge } from '@/components/estudiante/achievement-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Zap } from 'lucide-react'

export default async function LogrosPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all achievements and student's earned achievements
  const [achievementsRes, earnedRes] = await Promise.all([
    supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })
      .order('xp_reward', { ascending: true }),
    supabase
      .from('student_achievements')
      .select('achievement_id, earned_at')
      .eq('student_id', user.id),
  ])

  const allAchievements = (achievementsRes.data || []) as any[]
  const earnedAchievements = (earnedRes.data || []) as any[]

  // Build a set of earned achievement IDs with dates
  const earnedMap = new Map<string, string>()
  earnedAchievements.forEach((ea: any) => {
    earnedMap.set(ea.achievement_id, ea.earned_at)
  })

  // Split into earned and unearned
  const earned = allAchievements.filter((a: any) => earnedMap.has(a.id))
  const unearned = allAchievements.filter((a: any) => !earnedMap.has(a.id))

  // Total XP from achievements
  const totalAchievementXp = earned.reduce(
    (sum: number, a: any) => sum + (a.xp_reward || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Logros</h1>
          <p className="text-muted-foreground mt-1">
            Badges y reconocimientos por tu esfuerzo
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg">
          <Zap className="h-5 w-5 fill-amber-500" />
          <span className="font-bold">{totalAchievementXp} XP</span>
          <span className="text-sm">de logros</span>
        </div>
      </div>

      {allAchievements.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Aun no hay logros disponibles</p>
              <p className="text-sm">
                Pronto se agregaran badges para desbloquear
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Earned Section */}
          {earned.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Obtenidos ({earned.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {earned.map((a: any) => (
                  <AchievementBadge
                    key={a.id}
                    title={a.title}
                    description={a.description}
                    iconUrl={a.icon_url}
                    earnedAt={earnedMap.get(a.id)}
                    category={a.category}
                    xpReward={a.xp_reward}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Unearned Section */}
          {unearned.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                Por obtener ({unearned.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unearned.map((a: any) => (
                  <AchievementBadge
                    key={a.id}
                    title={a.title}
                    description={a.description}
                    iconUrl={a.icon_url}
                    earnedAt={null}
                    category={a.category}
                    xpReward={a.xp_reward}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
