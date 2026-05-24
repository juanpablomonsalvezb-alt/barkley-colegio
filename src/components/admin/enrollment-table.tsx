'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/formatters'
import { Search, CheckCircle, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  activa: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  suspendida: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelada: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  completada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

interface EnrollmentTableProps {
  enrollments: any[]
}

export function EnrollmentTable({ enrollments }: EnrollmentTableProps) {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(enrollments)

  const filtered = items.filter((e) => {
    const name = (e.profiles?.full_name || e.student_name || '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  async function handleApprove(enrollmentId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'activa' })
      .eq('id', enrollmentId)

    if (!error) {
      setItems((prev) =>
        prev.map((e) =>
          e.id === enrollmentId ? { ...e, status: 'activa' } : e
        )
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriculas</CardTitle>
        <div className="relative mt-2 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Estudiante</th>
                <th className="pb-3 pr-4 font-medium">Nivel</th>
                <th className="pb-3 pr-4 font-medium">Plan</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No se encontraron matriculas
                  </td>
                </tr>
              ) : (
                filtered.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {enrollment.profiles?.full_name || enrollment.student_name || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {enrollment.grade_level || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {enrollment.pricing_plans?.name || enrollment.plan_name || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={STATUS_STYLES[enrollment.status] || ''}
                        variant="secondary"
                      >
                        {enrollment.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {enrollment.created_at ? formatDate(enrollment.created_at) : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {enrollment.status === 'pendiente' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(enrollment.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Aprobar
                          </Button>
                        )}
                        <a
                          href={`/admin/estudiantes/${enrollment.student_id}`}
                          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Ver detalle
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
