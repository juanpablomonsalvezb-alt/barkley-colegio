# Arquitectura — Página de Asignatura (`/preview/[oa]`)

**Stack**: Next.js 16 App Router · Server Components SSR · Supabase · Tailwind v4 · TypeScript
**Estado**: Producción · https://barkley.vercel.app/preview/MA04-OA01
**Repo**: `src/app/preview/[oa]/`

---

## 1. Rutas

| URL | Componente | Tipo | Propósito |
|---|---|---|---|
| `/preview/[oa]` | `page.tsx` | Server | Vista principal con todos los artifacts |
| `/preview/[oa]/imprimir` | `imprimir/page.tsx` | Server | Hoja del alumno (standalone, sin respuestas) |
| `/preview/[oa]/solucionario` | `solucionario/page.tsx` | Server | Hoja con respuestas + explicaciones |

**Pública sin login**: middleware `src/lib/supabase/middleware.ts` exime `/preview/*`.

---

## 2. Estructura de archivos

```
src/app/preview/[oa]/
├── page.tsx                     ← Server Component principal
├── audio-player.tsx             ← Cliente · player MP3 custom
├── video-player.tsx             ← Cliente · <video> + VideoPlaceholder
├── slides-viewer.tsx            ← Cliente · iframe PDF
├── flashcards-deck.tsx          ← Cliente · flip 3D + shuffle
├── quiz-carousel.tsx            ← Cliente · 1 pregunta a la vez + nav
├── section-nav.tsx              ← Cliente · sidebar sticky + scroll-spy
├── share-button.tsx             ← Cliente · clipboard copy
├── markdown.tsx                 ← Cliente · render markdown (guía estudio)
├── worksheet-view.tsx           ← Cliente · hoja imprimible reutilizable
├── imprimir/
│   └── page.tsx                 ← Server · variante ejercicios
└── solucionario/
    └── page.tsx                 ← Server · variante con respuestas
```

---

## 3. Flujo de datos

```
[Browser request /preview/MA04-OA01]
        ↓
[Middleware: bypass auth si /preview/*]
        ↓
[page.tsx Server Component]
        ↓
[Supabase service-role client]
        ↓
[Query lessons WHERE slug ILIKE 'ma04-oa01%']
  ↳ JOIN units (audio, video, slides, flashcards, mindmap, study_guide)
  ↳ JOIN courses (grade_level)
  ↳ JOIN subjects (name, color, icon)
        ↓
[Query quizzes WHERE lesson_id = X]
        ↓
[Query questions WHERE quiz_id = X ORDER BY display_order]
        ↓
[Normalizers (en page.tsx)]
  ├── normalizeFlashcards()     → [{front, back}]
  └── normalizeMindMap()        → {label, children} (deshabilitado)
        ↓
[Render SectionShells por cada artefacto disponible]
  ├── Si artifact existe → componente cliente
  └── Si no → <EmptyState message="Generándose…" />
        ↓
[HTML SSR enviado al browser]
```

---

## 4. Secciones (en orden vertical)

| # | ID | Componente | Origen datos | Estado |
|---|---|---|---|---|
| 1 | `audio` | `AudioPlayer` | `units.audio_overview_url` (MP3 Storage) | ✅ producción |
| 2 | `video` | `VideoPlayer` / `VideoPlaceholder` | `units.video_overview_url` (MP4 Storage) | ✅ producción |
| 3 | `lesson` | `dangerouslySetInnerHTML` | `lessons.content_html` (DB) | ✅ producción |
| 4 | `quiz` | `QuizCarousel` | `questions[]` (DB join) | ✅ producción |
| 5 | `worksheet` | 2 botones a sub-rutas | links a `/imprimir` y `/solucionario` | ✅ producción |
| 6 | `slides` | `SlidesViewer` (iframe) | `units.slide_deck_url` (PDF Storage) | ✅ producción |
| 7 | `flashcards` | `FlashcardsDeck` | `units.flashcards_json` (DB JSONB) | ✅ producción |
| 8 | `guide` | `Markdown` | `units.study_guide_md` (DB TEXT) | ✅ producción |
| 9 | `reinforcement` | `dangerouslySetInnerHTML` | `lessons.reinforcement_content_html` | ✅ producción |
| 10 | `challenge` | `dangerouslySetInnerHTML` + `projectDescription` | `lessons.challenge_*` | ✅ producción |

**Eliminados**: infografía (bug Google RPC) · mapa mental (poco útil en matemática) · animales 🐶🦊.

---

## 5. Layout visual

```
┌─────────────────────────────────────────────────────────────┐
│  HERO (papel cálido #FDFBF7)                                │
│  · Badge "Barkley" + badge asignatura coloreada             │
│  · Breadcrumb: curso › unidad                               │
│  · H1 Fraunces 5xl + subrayado naranja                      │
│  · Pills meta: ⏱ min · ⚡ dificultad · 📝 # preguntas       │
└─────────────────────────────────────────────────────────────┘
┌────────┬────────────────────────────────────────────────────┐
│ SIDEBAR│  CONTENIDO PRINCIPAL                               │
│ sticky │  (max-w-3xl, espaciado 6/8)                        │
│ 220px  │                                                    │
│        │  ┌─ SectionShell ────────────────────────────────┐ │
│ ○ ●○○  │  │ icon-tile 56×56 + eyebrow + h2 Fraunces       │ │
│ ○○○○○  │  │ descripción muted                             │ │
│ ○○     │  │ ─────────────────                             │ │
│        │  │ {componente cliente}                          │ │
│ (item  │  └───────────────────────────────────────────────┘ │
│ activo │                                                    │
│ = bg   │  ... (10 secciones)                                │
│ naran- │                                                    │
│ ja)    │  ┌─ Footer ──────────────────────────────────────┐ │
│        │  │ Marca "B" + ShareButton + créditos            │ │
│        │  └───────────────────────────────────────────────┘ │
└────────┴────────────────────────────────────────────────────┘
```

Mobile (<md): sidebar → pill bar horizontal sticky top, scroll-snap.

---

## 6. Sistema de diseño

### Paleta cálida (Tailwind v4 `@theme` en `globals.css`)

| Token | Hex | Uso |
|---|---|---|
| `--color-paper` | `#FDFBF7` | Fondo principal |
| `--color-paper-2` | `#F7F2E8` | Hover suave |
| `--color-paper-3` | `#EFE7D5` | Borders |
| `--color-ink` | `#2C2826` | Texto principal |
| `--color-ink-soft` | `#5A4F47` | Secundario |
| `--color-ink-mute` | `#8A7F75` | Terciario |
| `--color-brand` | `#F97316` | Naranja Barkley |
| `--color-brand-soft` | `#FFE4D1` | Naranja claro / tiles |
| `--color-brand-deep` | `#C2410C` | Naranja oscuro / texto contraste |
| `--color-mint` | `#10B981` | Éxito / correcto |
| `--color-honey` | `#EAB308` | Hints / quiz |
| `--color-coral` | `#FF6B47` | Refuerzo |
| (esmeralda) | `#047857` | Desafío |

### Tipografía

- **Headings**: `Fraunces` (Google Fonts, axes SOFT+WONK)
- **Body**: `Lexend` (legibilidad infantil)
- **Mono**: `Geist Mono` (códigos OA)
- Cargadas con `next/font/google` en `layout.tsx`, `display: swap`

### Color por sección (icon-tile)

`audio:sky · video:coral · lesson:mint · quiz:honey · worksheet:brand · slides:brand · flashcards:rose · guide:amber-deep · reinforcement:coral · challenge:emerald`

---

## 7. Base de datos

### Tabla `lessons`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `unit_id` | UUID FK → units | |
| `slug` | TEXT UNIQUE | formato: `ma04-oa01-...` (búsqueda por OA) |
| `title` | TEXT | |
| `content_html` | TEXT | HTML lección principal |
| `reinforcement_content_html` | TEXT | HTML refuerzo (<60% quiz) |
| `challenge_content_html` | TEXT | HTML desafío (>85% quiz) |
| `challenge_project_description` | TEXT | proyecto práctico |
| `estimated_minutes`, `difficulty_level` | INT | meta |

### Tabla `units` (artifacts NotebookLM)

| Columna | Tipo | Bucket / Origen |
|---|---|---|
| `audio_overview_url` | TEXT | `audio-overviews/{unit_id}.mp3` |
| `video_overview_url` | TEXT | `unit-artifacts/{unit_id}/video.mp4` |
| `slide_deck_url` | TEXT | `unit-artifacts/{unit_id}/slides.pdf` |
| `flashcards_json` | JSONB | `{cards: [{front, back}]}` |
| `study_guide_md` | TEXT | Markdown |
| `mind_map_json` | JSONB | (campo persiste, sección deshabilitada) |
| `infographic_url` | TEXT | (campo persiste, sección deshabilitada) |
| `audio_overview_status` | TEXT | pendiente/generando/listo/fallido |
| `audio_overview_notebook_id` | TEXT | ID notebook NotebookLM (reuso) |
| `audio_overview_duration_seconds` | INT | duración MP3 |
| `audio_overview_generated_at`, `artifacts_generated_at` | TIMESTAMPTZ | |

### Tablas `quizzes` + `questions`

Standard. `questions.options` JSONB. `questions.correct_answer` JSONB (string/array/object según `question_type`).

### Storage buckets (public)

- `audio-overviews/` → MP3
- `unit-artifacts/{unit_id}/` → video.mp4, slides.pdf

---

## 8. Pipeline de contenido (cómo se llena)

```
┌──────────────────┐
│ 1. SEED DB       │  scripts/seed-4basico.ts (Node TS)
│    Estructura    │  → 4 subjects + 4 courses + 11 units + 32 lesson placeholders
└────────┬─────────┘
         ↓
┌──────────────────┐
│ 2. CONTENIDO     │  Manual (Claude chat) o vía Anthropic API:
│    lección/quiz/ │  → JSON en generated/4_basico/{OA_CODE}.json
│    refuerzo/     │  → scripts/seed-content.ts inserta a DB
│    desafío       │  → Tablas: lessons, quizzes, questions, adaptive_rules
└────────┬─────────┘
         ↓
┌──────────────────┐
│ 3. ARTIFACTS     │  scripts/generate-all-artifacts.py (notebooklm-py)
│    NotebookLM    │  Por cada unidad:
│                  │  · Crea notebook + sube texto fuente
│                  │  · Genera audio/video/slides/flashcards/mindmap/guía
│                  │  · Descarga MP3/MP4/PDF/JSON
│                  │  · Sube a Storage (audio-overviews, unit-artifacts)
│                  │  · Actualiza units.audio_overview_url, etc.
└──────────────────┘
```

Scripts auxiliares:
- `regen-failed.py` — retry artifacts que fallaron
- `regen-spanish-visuals.py` — forzar visuals en español
- `regen-es-strict.py` — instrucciones español ultra-fuertes
- `regen-flashcards.py` — solo flashcards
- `regen-mindmap-es.py` — mindmap + post-process traducción
- `regen-slides-final.py` — último intento slides
- `translate-saved-mindmap.py` — traduce JSON ya guardado

---

## 9. Patrones técnicos clave

- **Server Component principal** + Client Components puntuales (`'use client'` solo donde hay interactividad)
- **Service role client** en server-only (acceso público sin RLS para preview)
- **Normalizers en page.tsx**: convierten shape variable de NotebookLM a tipos esperados por componentes
- **EmptyState elegante**: si artifact falta, muestra "Generándose…" en vez de romper layout
- **Print CSS** (`@media print` en `globals.css`): solo `.worksheet` se imprime, todo lo demás `display: none`
- **Force dynamic** (`export const dynamic = 'force-dynamic'`): cada request lee fresh DB (no cache)
- **Scroll-spy nav**: `IntersectionObserver` en client component
- **Tipografía editorial**: serif (Fraunces) para emoción + sans humanista (Lexend) para lectura

---

## 10. Performance + caching

- SSR fresh por request (no ISR todavía — TODO si tráfico crece)
- Storage públicos sirven assets directo desde Supabase CDN
- Audio/video lazy loading nativo HTML5
- Slides en iframe → carga progresiva PDF
- Fonts con `display: swap` (no bloquea render)

---

## 11. Puntos pendientes / mejoras futuras

1. **ISR**: cachear cada `/preview/[oa]` por 1h en Vercel Edge
2. **Subject color dinámico**: hoy hardcoded por nombre, pasar a `subjects.color` de DB
3. **OG image dinámico**: `next/og` para previews al compartir
4. **Sitemap dinámico**: indexar todos los OAs en Google
5. **Analytics**: Vercel Analytics + Plausible para tracking
6. **A11y audit**: lighthouse + axe
7. **Print: solucionario en PDF servidor**: hoy depende de browser print; futuro `@react-pdf/renderer` o `puppeteer`
8. **Versión privada estudiante** (con login): mismo layout pero progreso real, tracking quiz, XP

---

## 12. URLs producción

| Tipo | URL |
|---|---|
| Preview piloto | https://barkley.vercel.app/preview/MA04-OA01 |
| Hoja imprimible | https://barkley.vercel.app/preview/MA04-OA01/imprimir |
| Solucionario | https://barkley.vercel.app/preview/MA04-OA01/solucionario |

---

**Última actualización**: 2026-05-24
**Estado piloto**: 7 artifacts producción, audio 10/10, diseño 8/10, sin animales mascota, sin infografía, sin mapa mental.
