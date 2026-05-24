'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

interface LessonEditorProps {
  lesson?: any
  unitId: string
}

export function LessonEditor({ lesson, unitId }: LessonEditorProps) {
  const isEdit = !!lesson
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: lesson?.title || '',
    slug: lesson?.slug || '',
    type: lesson?.type || 'video',
    order_index: lesson?.order_index ?? 0,
    video_url: lesson?.video_url || '',
    content_html: lesson?.content_html || '',
    pdf_url: lesson?.pdf_url || '',
    difficulty: lesson?.difficulty ?? 3,
    estimated_minutes: lesson?.estimated_minutes ?? 15,
    is_published: lesson?.is_published ?? false,
    unit_id: unitId,
    // Adaptive paths content
    reinforcement_html: lesson?.reinforcement_html || '',
    challenge_html: lesson?.challenge_html || '',
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
    const data = { ...form }

    if (isEdit) {
      await supabase.from('lessons').update(data).eq('id', lesson.id)
    } else {
      await supabase.from('lessons').insert(data)
    }

    setSaving(false)
    window.history.back()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Editar Leccion' : 'Nueva Leccion'}</CardTitle>
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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="video">Video</option>
                <option value="texto">Texto</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min={0}
                value={form.order_index}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order_index: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad (1-5)</Label>
              <select
                id="difficulty"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={form.difficulty}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    difficulty: parseInt(e.target.value),
                  }))
                }
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="video_url">URL Video</Label>
              <Input
                id="video_url"
                type="url"
                value={form.video_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, video_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_url">URL PDF</Label>
              <Input
                id="pdf_url"
                type="url"
                value={form.pdf_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pdf_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutes">Minutos Estimados</Label>
            <Input
              id="minutes"
              type="number"
              min={1}
              className="max-w-32"
              value={form.estimated_minutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  estimated_minutes: parseInt(e.target.value) || 15,
                }))
              }
            />
          </div>

          <Tabs defaultValue="principal">
            <TabsList>
              <TabsTrigger value="principal">Principal</TabsTrigger>
              <TabsTrigger value="refuerzo">Refuerzo</TabsTrigger>
              <TabsTrigger value="desafio">Desafio</TabsTrigger>
            </TabsList>
            <TabsContent value="principal">
              <div className="space-y-2 pt-4">
                <Label htmlFor="content_html">Contenido HTML</Label>
                <textarea
                  id="content_html"
                  className="min-h-48 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm"
                  value={form.content_html}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      content_html: e.target.value,
                    }))
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="refuerzo">
              <div className="space-y-2 pt-4">
                <Label htmlFor="reinforcement_html">
                  Contenido de Refuerzo
                </Label>
                <textarea
                  id="reinforcement_html"
                  className="min-h-48 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm"
                  value={form.reinforcement_html}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      reinforcement_html: e.target.value,
                    }))
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="desafio">
              <div className="space-y-2 pt-4">
                <Label htmlFor="challenge_html">Contenido Desafio</Label>
                <textarea
                  id="challenge_html"
                  className="min-h-48 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm"
                  value={form.challenge_html}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      challenge_html: e.target.value,
                    }))
                  }
                />
              </div>
            </TabsContent>
          </Tabs>

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
              {isEdit ? 'Guardar Cambios' : 'Crear Leccion'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
