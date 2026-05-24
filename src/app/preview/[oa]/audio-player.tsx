'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Download, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  src: string
  title?: string
  subtitle?: string
  durationSeconds?: number | null
}

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ src, title = 'Podcast de la unidad', subtitle, durationSeconds }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setCurrent(a.currentTime)
    const onMeta = () => setDuration(a.duration)
    const onEnd = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      a.play()
      setPlaying(true)
    }
  }

  const seek = (delta: number) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(duration, a.currentTime + delta))
  }

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Number(e.target.value)
  }

  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    a.muted = !a.muted
    setMuted(a.muted)
  }

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75]
    const next = rates[(rates.indexOf(rate) + 1) % rates.length]
    const a = audioRef.current
    if (a) a.playbackRate = next
    setRate(next)
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
        {/* Cover */}
        <div className="relative flex h-48 md:h-full items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
          <div className="relative text-7xl drop-shadow-lg" aria-hidden>🎙️</div>
        </div>

        {/* Controls */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-semibold text-indigo-600">Podcast generado con IA</div>
            <h3 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>

          {/* Scrubber */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={current}
              onChange={onScrub}
              className="w-full h-1.5 appearance-none rounded-full bg-slate-200 outline-none accent-indigo-600 cursor-pointer"
              style={{ background: `linear-gradient(to right, rgb(79 70 229) ${pct}%, rgb(226 232 240) ${pct}%)` }}
            />
            <div className="flex justify-between text-xs font-mono text-slate-500 tabular-nums">
              <span>{formatTime(current)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => seek(-15)} className="h-9 w-9 text-slate-600 hover:text-slate-900">
              <Rewind className="h-4 w-4" />
            </Button>
            <Button onClick={toggle} className="h-11 w-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition active:scale-95">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => seek(15)} className="h-9 w-9 text-slate-600 hover:text-slate-900">
              <FastForward className="h-4 w-4" />
            </Button>

            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={cycleRate} className="h-8 px-2 font-mono text-xs text-slate-600 hover:text-slate-900">
                {rate}x
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 text-slate-600 hover:text-slate-900">
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <a
                href={src}
                download
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                aria-label="Descargar MP3"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
