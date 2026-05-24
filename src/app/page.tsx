import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap, BookOpen, Brain, Shield, DollarSign, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Barkley</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/registro">
              <Button>Matricular</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            El colegio online más{' '}
            <span className="text-blue-600">accesible</span> de Chile
          </h1>
          <p className="text-xl text-muted-foreground">
            Educación de calidad desde 5° básico a 4° medio. Contenido interactivo,
            adaptativo y preparado para Exámenes Libres MINEDUC.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/registro">
              <Button size="lg" className="text-lg px-8">
                Comenzar ahora
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Desde <span className="font-bold text-foreground">$35.000 CLP/mes</span> — 60% menos que la competencia
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <BookOpen className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Contenido Interactivo</h3>
              <p className="text-muted-foreground text-sm">
                Videos, lecciones y quizzes diseñados para aprender a tu ritmo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Brain className="h-10 w-10 text-purple-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Aprendizaje Adaptativo</h3>
              <p className="text-muted-foreground text-sm">
                Rutas personalizadas según tu rendimiento: refuerzo, avance normal o desafío
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-10 w-10 text-green-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Validación MINEDUC</h3>
              <p className="text-muted-foreground text-sm">
                Preparación completa para Exámenes Libres con certificación oficial
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <DollarSign className="h-10 w-10 text-yellow-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Precio Justo</h3>
              <p className="text-muted-foreground text-sm">
                Desde $35.000 CLP/mes — educación de calidad sin hipotecar el presupuesto familiar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Users className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Panel de Apoderados</h3>
              <p className="text-muted-foreground text-sm">
                Seguimiento en tiempo real del progreso, alertas y reportes semanales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <GraduationCap className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">5° Básico a 4° Medio</h3>
              <p className="text-muted-foreground text-sm">
                Cobertura completa de la malla curricular chilena
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Barkley. Colegio online chileno.</p>
        </div>
      </footer>
    </div>
  )
}
