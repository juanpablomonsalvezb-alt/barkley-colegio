'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'

interface StudentProfileEditFormProps {
  profileId: string
  initialName: string
}

export function StudentProfileEditForm({ profileId, initialName }: StudentProfileEditFormProps) {
  const [fullName, setFullName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    if (fullName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', profileId)

      if (updateError) {
        setError('Error al guardar los cambios')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : saved ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Guardado
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Guardar Cambios
          </>
        )}
      </Button>
    </form>
  )
}
