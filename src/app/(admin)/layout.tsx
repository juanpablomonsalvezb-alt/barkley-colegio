'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Navbar } from '@/components/shared/navbar'
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  Users,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Matrículas', href: '/admin/matriculas', icon: GraduationCap },
  { label: 'Pagos', href: '/admin/pagos', icon: CreditCard },
  { label: 'Estudiantes', href: '/admin/estudiantes', icon: Users },
  { label: 'Contenido', href: '/admin/contenido', icon: FileText },
  { label: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={sidebarItems} role="admin" />
      <Navbar />
      <main className="ml-64 pt-16 p-6">{children}</main>
    </div>
  )
}
