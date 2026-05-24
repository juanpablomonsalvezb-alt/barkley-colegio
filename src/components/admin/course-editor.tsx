'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GRADE_LEVELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

interface CourseEditorProps {
  course?: any
  subjects: any[]
}

export function CourseEditor({ course, subjects }: CourseEditorProps) {
  const isEdit = !!course
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    subject_id: course?.subject_id || '',
    grade_level: course?.grade_level || '',
    description: course?.description || '',
    thumbnail_url: course?.thumbnail_url || '',
    is_published: course?.is_published ?? false,
  })

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : slugify(title),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()

    if (isEdit) {
      await supabase
        .from('courses')
        .update(form)
        .eq('id', course.id)
    } else {
      await supabase
        .from('courses')
        .insert(form)
    }

    setSaving(false)
    window.location.href = '/admin/contenido'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Editar Curso' : 'Nuevo Curso'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Asignatura</Label>
              <select
                id="subject"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={form.subject_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subject_id: e.target.value }))
                }
                required
              >
                <option value="">Seleccionar...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Nivel</Label>
              <select
                id="grade"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={form.grade_level}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, grade_level: e.target.value }))
                }
                required
              >
                <option value="">Seleccionar...</option>
                {GRADE_LEVELS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <textarea
              id="description"
              className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">URL Thumbnail</Label>
            <Input
              id="thumbnail"
              type="url"
              value={form.thumbnail_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              className="h-4 w-4 rounded border-input"
              checked={form.is_published}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, is_published: e.target.checked }))
              }
            />
            <Label htmlFor="published">Publicado</Label>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEdit ? 'Guardar Cambios' : 'Crear Curso'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
