'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/formatters'
import { Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StudentTableProps {
  students: any[]
}

export function StudentTable({ students }: StudentTableProps) {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState(students)

  const filtered = items.filter((s) => {
    const q = search.toLowerCase()
    const name = (s.full_name || '').toLowerCase()
    const rut = (s.rut || '').toLowerCase()
    return name.includes(q) || rut.includes(q)
  })

  async function toggleActive(studentId: string, currentActive: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentActive })
      .eq('id', studentId)

    if (!error) {
      setItems((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, is_active: !currentActive } : s
        )
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estudiantes</CardTitle>
        <div className="relative mt-2 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o RUT..."
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
                <th className="pb-3 pr-4 font-medium">Nombre</th>
                <th className="pb-3 pr-4 font-medium">RUT</th>
                <th className="pb-3 pr-4 font-medium">Nivel</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium">Ultimo Acceso</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No se encontraron estudiantes
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {student.full_name || '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-muted-foreground">
                      {student.rut || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {student.grade_level || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={
                          student.is_active !== false
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }
                        variant="secondary"
                      >
                        {student.is_active !== false ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {student.last_login
                        ? formatRelativeTime(student.last_login)
                        : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/estudiantes/${student.id}`}
                          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Ver detalle
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleActive(student.id, student.is_active !== false)
                          }
                        >
                          {student.is_active !== false ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
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
