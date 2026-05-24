'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Navbar } from '@/components/shared/navbar'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  UserCircle,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Panel', href: '/panel', icon: LayoutDashboard },
  { label: 'Mis Hijos', href: '/hijos', icon: Users },
  { label: 'Pagos', href: '/pagos', icon: CreditCard },
  { label: 'Alertas', href: '/alertas', icon: Bell },
  { label: 'Perfil', href: '/perfil-apoderado', icon: UserCircle },
]

export default function ApoderadoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={sidebarItems} role="apoderado" />
      <Navbar />
      <main className="ml-64 pt-16 p-6">{children}</main>
    </div>
  )
}
