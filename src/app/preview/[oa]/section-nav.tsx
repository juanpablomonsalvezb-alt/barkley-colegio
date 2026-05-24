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
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#8A7F75] mb-3 px-3">
          En esta unidad
        </div>
        <ul className="space-y-1">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] transition ${
                    isActive
                      ? 'bg-[#FFE4D1] text-[#C2410C] font-semibold ring-1 ring-[#FFCAB8] shadow-[0_1px_0_rgba(194,65,12,0.05),0_4px_12px_-6px_rgba(194,65,12,0.18)]'
                      : s.available
                        ? 'text-[#5A4F47] hover:bg-[#F7F2E8] hover:text-[#2C2826]'
                        : 'text-[#B8AFA4] hover:bg-[#FDFBF7]'
                  }`}
                >
                  <span className="text-base leading-none">{s.icon}</span>
                  <span className="flex-1 truncate">{s.label}</span>
                  {!s.available && (
                    <span className={`text-[9px] uppercase tracking-wider font-semibold ${isActive ? 'text-[#C2410C]/60' : 'text-[#B8AFA4]'}`}>
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
      <nav className="lg:hidden sticky top-0 z-40 -mx-4 border-b border-[#EFE7D5] bg-[#FDFBF7]/95 px-4 backdrop-blur">
        <div className="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'bg-white text-[#5A4F47] ring-1 ring-[#EFE7D5] hover:bg-[#F7F2E8]'
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
