'use client'

import { useState } from 'react'
import { signupParent } from '@/app/(auth)/registro/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function RegistroForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signupParent(formData)
    if (result?.error) {
      setError(
        'general' in result.error
          ? (result.error as any).general?.[0]
          : 'Error al registrar'
      )
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>
          Registra tu familia para comenzar
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo (apoderado)</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="María González"
              required
              minLength={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rut">RUT (opcional)</Label>
            <Input
              id="rut"
              name="rut"
              type="text"
              placeholder="12.345.678-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+56 9 1234 5678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Crear Cuenta de Apoderado'
            )}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
