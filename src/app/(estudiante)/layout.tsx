'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Navbar } from '@/components/shared/navbar'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Trophy,
  RefreshCw,
  UserCircle,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/cursos', icon: BookOpen },
  { label: 'Progreso', href: '/progreso', icon: BarChart3 },
  { label: 'Logros', href: '/logros', icon: Trophy },
  { label: 'Repaso', href: '/repaso', icon: RefreshCw },
  { label: 'Perfil', href: '/perfil', icon: UserCircle },
]

export default function EstudianteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={sidebarItems} role="estudiante" />
      <Navbar />
      <main className="ml-64 pt-16 p-6">{children}</main>
    </div>
  )
}
