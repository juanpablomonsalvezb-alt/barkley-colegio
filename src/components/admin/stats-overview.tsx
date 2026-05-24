'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, CreditCard, TrendingDown } from 'lucide-react'
import { formatCLP } from '@/lib/formatters'

interface StatsOverviewProps {
  totalStudents: number
  activeEnrollments: number
  monthlyRevenue: number
  desertion: number
}

export function StatsOverview({
  totalStudents,
  activeEnrollments,
  monthlyRevenue,
  desertion,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Estudiantes Activos',
      value: totalStudents.toLocaleString('es-CL'),
      icon: Users,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Matriculas Mes',
      value: activeEnrollments.toLocaleString('es-CL'),
      icon: GraduationCap,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Ingresos Mes',
      value: formatCLP(monthlyRevenue),
      icon: CreditCard,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: 'Tasa Desercion',
      value: `${desertion.toFixed(1)}%`,
      icon: TrendingDown,
      iconColor: desertion > 10 ? 'text-red-500' : 'text-orange-500',
      bgColor: desertion > 10 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-orange-50 dark:bg-orange-950/30',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
