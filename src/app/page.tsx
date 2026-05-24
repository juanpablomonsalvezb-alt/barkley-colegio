'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  GraduationCap,
  BookOpen,
  Brain,
  Shield,
  DollarSign,
  Users,
  Play,
  Target,
  Award,
  Repeat,
  FileCheck,
  Sparkles,
  Check,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { Footer } from '@/components/shared/footer'

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <span className="text-4xl md:text-5xl font-extrabold text-white">{target}</span>
      {suffix && <span className="text-lg text-blue-200 ml-1">{suffix}</span>}
    </div>
  )
}

const features = [
  {
    icon: Brain,
    title: 'Aprendizaje Adaptativo',
    description: '3 rutas personalizadas: refuerzo, normal y desafio segun el nivel de tu hijo.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Sparkles,
    title: 'Gamificacion',
    description: 'XP, niveles, logros y rachas que mantienen a tu hijo motivado cada dia.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Panel de Apoderado',
    description: 'Seguimiento en tiempo real del progreso, alertas y reportes semanales.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Repeat,
    title: 'Repaso Inteligente',
    description: 'Spaced repetition que refuerza lo aprendido en el momento justo.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: FileCheck,
    title: 'Curriculo MINEDUC',
    description: 'Contenido 100% alineado al curriculo nacional chileno vigente.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: DollarSign,
    title: 'Precio Justo',
    description: 'Desde $35.000/mes. Educacion premium sin hipotecar el presupuesto familiar.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
]

const plans = [
  {
    name: 'Plan Basico',
    price: '$35.000',
    period: '/mes',
    level: '5to a 8vo Basico',
    features: [
      'Todas las asignaturas del nivel',
      'Videos + quizzes adaptativos',
      'Panel de apoderado',
      'Preparacion Examenes Libres',
      'Soporte por chat',
    ],
    popular: false,
  },
  {
    name: 'Plan Media',
    price: '$45.000',
    period: '/mes',
    level: '1ro a 2do Medio',
    features: [
      'Todas las asignaturas del nivel',
      'Videos + quizzes adaptativos',
      'Panel de apoderado',
      'Preparacion Examenes Libres',
      'Repaso inteligente avanzado',
      'Soporte prioritario',
    ],
    popular: true,
  },
  {
    name: 'Plan Avanzado',
    price: '$55.000',
    period: '/mes',
    level: '3ro a 4to Medio',
    features: [
      'Todas las asignaturas del nivel',
      'Videos + quizzes adaptativos',
      'Panel de apoderado',
      'Preparacion Examenes Libres',
      'Repaso inteligente avanzado',
      'Orientacion vocacional',
      'Soporte prioritario',
    ],
    popular: false,
  },
]

const faqs = [
  {
    q: 'Es legal estudiar asi?',
    a: 'Si. En Chile existe la modalidad de Examenes Libres regulada por el MINEDUC. Tu hijo rinde los examenes en un establecimiento autorizado y obtiene la certificacion oficial. Es 100% legal y valido.',
  },
  {
    q: 'Como funciona Barkley?',
    a: 'Tu hijo estudia con videos pregrabados de 5-8 minutos, luego responde quizzes adaptativos que ajustan la dificultad a su nivel. El sistema detecta que necesita reforzar y le ofrece rutas personalizadas.',
  },
  {
    q: 'Que necesito para empezar?',
    a: 'Solo un computador, tablet o celular con conexion a internet. No necesitas libros, uniformes ni materiales adicionales. Todo esta incluido en la plataforma.',
  },
  {
    q: 'Puedo hacer seguimiento del progreso de mi hijo?',
    a: 'Si, como apoderado tienes acceso a un panel completo donde ves el progreso en tiempo real, recibes alertas cuando hay inactividad y reportes semanales automaticos.',
  },
  {
    q: 'Hay profesores?',
    a: 'No hay profesores en vivo, pero todo el contenido es creado por expertos pedagogos y potenciado por inteligencia artificial para adaptarse al ritmo de cada estudiante.',
  },
  {
    q: 'Como son los pagos?',
    a: 'Pago mensual sin contratos de permanencia. Aceptamos Transbank (tarjetas de credito/debito) y transferencia bancaria. Puedes cancelar cuando quieras.',
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Barkley</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#caracteristicas" className="hover:text-foreground transition-colors">Caracteristicas</a>
            <a href="#precios" className="hover:text-foreground transition-colors">Precios</a>
            <a href="#preguntas" className="hover:text-foreground transition-colors">Preguntas</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar Sesion</Button>
            </Link>
            <Link href="/registro">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/25">
                Matricular
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <a href="#como-funciona" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Como funciona</a>
              <a href="#caracteristicas" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Caracteristicas</a>
              <a href="#precios" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Precios</a>
              <a href="#preguntas" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Preguntas</a>
              <div className="flex gap-2 pt-2 border-t">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">Iniciar Sesion</Button>
                </Link>
                <Link href="/registro" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white" size="sm">Matricular</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90">
              <Award className="w-4 h-4" />
              <span>Validado por Examenes Libres MINEDUC</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              El Colegio Online{' '}
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                de Chile
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
              60% mas economico que un colegio tradicional. Sin profesores, sin uniformes.
              Aprendizaje adaptativo potenciado por IA para que tu hijo aprenda a su ritmo.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/registro">
                <Button size="lg" className="text-lg px-8 h-14 bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/20 font-semibold w-full sm:w-auto">
                  Registrar a mi hijo
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto bg-transparent">
                  Conocer mas
                  <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-12 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl shadow-2xl shadow-blue-900/30 p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <AnimatedCounter target="60%" />
                <p className="text-blue-200 text-sm font-medium">mas economico que un colegio tradicional</p>
              </div>
              <div className="space-y-2">
                <AnimatedCounter target="5to" suffix="a 4to Medio" />
                <p className="text-blue-200 text-sm font-medium">cobertura curricular completa</p>
              </div>
              <div className="space-y-2">
                <AnimatedCounter target="100%" />
                <p className="text-blue-200 text-sm font-medium">valido por Examenes Libres MINEDUC</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Asi de simple</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como funciona Barkley</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Play,
                step: '01',
                title: 'Clases en Video',
                desc: 'Lecciones pregrabadas de 5-8 minutos, creadas por expertos pedagogos. Tu hijo aprende a su propio ritmo.',
              },
              {
                icon: Target,
                step: '02',
                title: 'Quiz Adaptativo',
                desc: 'Despues de cada leccion, quizzes inteligentes que se adaptan automaticamente al nivel de comprension.',
              },
              {
                icon: Award,
                step: '03',
                title: 'Certificacion Oficial',
                desc: 'Preparacion completa para rendir Examenes Libres ante el MINEDUC y obtener certificacion oficial.',
              },
            ].map((item) => (
              <Card key={item.step} className="relative group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-card">
                <CardContent className="p-8 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="caracteristicas" className="py-24 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Todo incluido</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Caracteristicas que marcan la diferencia</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.bg)}>
                    <feature.icon className={cn('w-6 h-6', feature.color)} />
                  </div>
                  <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Planes simples</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Precios transparentes, sin sorpresas</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Pago mensual, sin contratos de permanencia. Cancela cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  'relative transition-all duration-300 hover:-translate-y-1',
                  plan.popular
                    ? 'border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-600/10 scale-[1.02]'
                    : 'border-0 shadow-md hover:shadow-lg'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                    Mas popular
                  </div>
                )}
                <CardHeader className="pb-4 pt-8">
                  <p className="text-sm text-muted-foreground font-medium">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{plan.level}</p>
                </CardHeader>
                <CardContent className="pb-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/registro" className="block">
                    <Button
                      className={cn(
                        'w-full h-11 font-semibold',
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                          : ''
                      )}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Comenzar ahora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="py-24 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Resolvemos tus dudas</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card rounded-xl border px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 md:p-16 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(120,119,198,0.4),transparent)]" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Inscribe a tu hijo hoy
              </h2>
              <p className="text-blue-100/90 text-lg leading-relaxed">
                Dale la oportunidad de una educacion flexible, adaptativa y certificada.
                Sin uniformes, sin estres, a su propio ritmo.
              </p>
              <Link href="/registro">
                <Button size="lg" className="text-lg px-10 h-14 bg-white text-blue-700 hover:bg-blue-50 shadow-xl font-semibold mt-4">
                  Comenzar ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
