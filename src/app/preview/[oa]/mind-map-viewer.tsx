'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

export interface MindMapNode {
  label: string
  description?: string
  children?: MindMapNode[]
}

interface MindMapViewerProps {
  root: MindMapNode
}

function Node({ node, depth = 0, defaultOpen = true }: { node: MindMapNode; depth?: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const hasChildren = (node.children?.length ?? 0) > 0

  const palette = [
    'from-indigo-500 to-purple-500 border-indigo-200 bg-indigo-50/50 text-indigo-900',
    'from-sky-500 to-cyan-500 border-sky-200 bg-sky-50/50 text-sky-900',
    'from-emerald-500 to-teal-500 border-emerald-200 bg-emerald-50/50 text-emerald-900',
    'from-amber-500 to-orange-500 border-amber-200 bg-amber-50/50 text-amber-900',
    'from-rose-500 to-pink-500 border-rose-200 bg-rose-50/50 text-rose-900',
  ]
  const cls = palette[depth % palette.length]

  return (
    <div className="relative">
      <div className={`rounded-xl border ${cls.split(' ').slice(2).join(' ')} px-4 py-3`}>
        <button
          onClick={() => hasChildren && setOpen((o) => !o)}
          className="flex w-full items-center gap-2 text-left"
        >
          {hasChildren && (
            <ChevronRight
              className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''} opacity-60`}
            />
          )}
          <span className="font-semibold leading-tight">{node.label}</span>
        </button>
        {node.description && <p className="mt-1 text-sm text-slate-600 leading-relaxed pl-6">{node.description}</p>}
      </div>
      {hasChildren && open && (
        <div className="relative mt-3 ml-6 space-y-3 border-l-2 border-dashed border-slate-200 pl-6">
          {node.children!.map((child, i) => (
            <Node key={i} node={child} depth={depth + 1} defaultOpen={depth < 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MindMapViewer({ root }: MindMapViewerProps) {
  return (
    <div className="rounded-xl bg-slate-50/50 p-4 md:p-6">
      <Node node={root} />
    </div>
  )
}
