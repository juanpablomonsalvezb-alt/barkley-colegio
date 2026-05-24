import { GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-shadow">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Barkley</span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-2xl border shadow-xl shadow-black/5 p-8">
          {children}
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            &larr; Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
