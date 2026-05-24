import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Barkley</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              El colegio online de Chile. Educacion adaptativa, validada por Examenes Libres MINEDUC, a una fraccion del costo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Plataforma</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Inicio</Link></li>
              <li><a href="/#precios" className="hover:text-foreground transition-colors">Precios</a></li>
              <li><a href="/#preguntas" className="hover:text-foreground transition-colors">Preguntas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Cuenta</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesion</Link></li>
              <li><Link href="/registro" className="hover:text-foreground transition-colors">Registrarse</Link></li>
              <li><Link href="/recuperar" className="hover:text-foreground transition-colors">Recuperar contrasena</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; 2026 Barkley &mdash; Colegio Online de Chile. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
