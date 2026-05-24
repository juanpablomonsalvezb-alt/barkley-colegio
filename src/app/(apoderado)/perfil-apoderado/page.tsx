import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatRut } from '@/lib/formatters'
import { User, Mail, Phone, IdCard, Users, GraduationCap } from 'lucide-react'
import { ProfileEditForm } from './profile-edit-form'

export default async function PerfilApoderadoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil del apoderado
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Obtener hijos
  const { data: children } = await supabase
    .from('profiles')
    .select('id, full_name, email, grade_level, avatar_url, is_active')
    .eq('parent_id', user.id)
    .eq('role', 'estudiante')

  const allChildren = children || []

  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const gradeLabels: Record<string, string> = {
    '5_basico': '5to Basico',
    '6_basico': '6to Basico',
    '7_basico': '7mo Basico',
    '8_basico': '8vo Basico',
    '1_medio': '1ro Medio',
    '2_medio': '2do Medio',
    '3_medio': '3ro Medio',
    '4_medio': '4to Medio',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Informacion personal y gestion de cuenta</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile.full_name}</CardTitle>
                <CardDescription>Apoderado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Correo electronico</p>
                <p className="text-sm">{profile.email}</p>
              </div>
            </div>

            {profile.rut && (
              <div className="flex items-center gap-3">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">RUT</p>
                  <p className="text-sm">{formatRut(profile.rut)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Telefono</p>
                <p className="text-sm">{profile.phone || 'No registrado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar Datos</CardTitle>
            <CardDescription>Actualiza tu nombre y telefono</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditForm
              profileId={profile.id}
              initialName={profile.full_name}
              initialPhone={profile.phone || ''}
            />
          </CardContent>
        </Card>
      </div>

      {/* Children list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-lg">Mis Hijos</CardTitle>
          </div>
          <CardDescription>
            {allChildren.length} estudiante{allChildren.length !== 1 ? 's' : ''} registrado{allChildren.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allChildren.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">No hay estudiantes registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allChildren.map((child) => {
                const childInitials = child.full_name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={child.avatar_url || undefined} alt={child.full_name} />
                        <AvatarFallback>{childInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{child.full_name}</p>
                        <p className="text-sm text-muted-foreground">{child.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {child.grade_level && (
                        <Badge variant="secondary">
                          {gradeLabels[child.grade_level] || child.grade_level}
                        </Badge>
                      )}
                      <Badge variant={child.is_active ? 'default' : 'destructive'}>
                        {child.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
