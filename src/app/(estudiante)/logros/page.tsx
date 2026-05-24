import { Card, CardContent } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function LogrosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Logros</h1>
        <p className="text-muted-foreground mt-1">Badges y reconocimientos</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aún no tienes logros</p>
            <p className="text-sm">Completa lecciones y quizzes para desbloquear badges</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
