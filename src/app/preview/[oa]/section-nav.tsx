'use client'

import { useEffect, useState } from 'react'

export interface NavSection {
  id: string
  label: string
  icon: string
  available: boolean
}

interface SectionNavProps {
  sections: NavSection[]
}

export default function SectionNav({ sections }: SectionNavProps) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block sticky top-24 self-start">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-3 px-3">
          En esta unidad
        </div>
        <ul className="space-y-0.5">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? 'bg-slate-900 text-white font-medium'
                      : s.available
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base leading-none">{s.icon}</span>
                  <span className="flex-1 truncate">{s.label}</span>
                  {!s.available && (
                    <span className={`text-[9px] uppercase tracking-wider font-semibold ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      Pronto
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile horizontal scroll */}
      <nav className="lg:hidden sticky top-0 z-40 -mx-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } ${!s.available ? 'opacity-60' : ''}`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
