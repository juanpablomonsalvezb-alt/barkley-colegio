#!/usr/bin/env python3
"""
Generador automático de Audio Overviews (podcasts) por unidad via NotebookLM.

Uso:
    python3 scripts/generate-audio-overviews.py --pilot           # 1 unidad piloto
    python3 scripts/generate-audio-overviews.py --grade 4_basico  # grado completo
    python3 scripts/generate-audio-overviews.py                   # TODAS las pendientes

Prerequisitos:
    pip install "notebooklm-py[browser]" supabase python-dotenv
    playwright install chromium
    notebooklm login   # primera vez, abre browser
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
import tempfile
from pathlib import Path
from typing import Any

# Carga .env.local
ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

try:
    from notebooklm import NotebookLMClient
except ImportError:
    print("❌ Instala notebooklm-py: pip install 'notebooklm-py[browser]'")
    sys.exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Instala supabase: pip install supabase")
    sys.exit(1)


SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = "audio-overviews"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_units(grade: str | None, only_pending: bool, pilot: bool) -> list[dict[str, Any]]:
    """Trae unidades con sus lecciones+contenido para generar el podcast."""
    q = supabase.table("units").select(
        "id, title, description, course_id, "
        "audio_overview_status, "
        "courses(id, title, grade_level, subject_id, subjects(name)), "
        "lessons(id, title, content_html, is_published)"
    )
    if grade:
        q = q.eq("courses.grade_level", grade)
    if only_pending:
        q = q.in_("audio_overview_status", ["pendiente", "fallido"])
    res = q.execute()
    units = res.data or []
    # Solo unidades con AL MENOS 1 lección con contenido real (no placeholder)
    filtered = []
    for u in units:
        valid_lessons = [
            l for l in (u.get("lessons") or [])
            if l.get("content_html") and "placeholder" not in (l.get("content_html") or "").lower()
        ]
        if valid_lessons:
            u["valid_lessons"] = valid_lessons
            filtered.append(u)
    if pilot:
        filtered = filtered[:1]
    return filtered


def build_source_text(unit: dict[str, Any]) -> str:
    """Concatena lecciones de la unidad en un solo texto markdown."""
    course = unit.get("courses") or {}
    subject = (course.get("subjects") or {}).get("name", "Desconocida")
    grade = course.get("grade_level", "")
    parts = [
        f"# Unidad: {unit['title']}",
        f"Asignatura: {subject}",
        f"Curso: {course.get('title', '')} ({grade})",
        f"\n{unit.get('description') or ''}",
        "\n---\n",
    ]
    for i, l in enumerate(unit["valid_lessons"], 1):
        parts.append(f"\n## Lección {i}: {l['title']}\n")
        # content_html → texto plano (sin tags) para NotebookLM
        html = l.get("content_html") or ""
        import re
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        parts.append(text)
    return "\n".join(parts)


def upload_mp3(unit_id: str, mp3_path: Path) -> str:
    """Sube MP3 a Supabase Storage y retorna URL pública."""
    key = f"{unit_id}.mp3"
    # Borra previo (idempotencia)
    try:
        supabase.storage.from_(BUCKET).remove([key])
    except Exception:
        pass
    with open(mp3_path, "rb") as f:
        supabase.storage.from_(BUCKET).upload(
            path=key,
            file=f.read(),
            file_options={"content-type": "audio/mpeg", "upsert": "true"},
        )
    return supabase.storage.from_(BUCKET).get_public_url(key)


def update_unit_status(unit_id: str, **kwargs):
    """Actualiza columnas audio_overview_* en DB."""
    supabase.table("units").update(kwargs).eq("id", unit_id).execute()


async def process_unit(client: NotebookLMClient, unit: dict[str, Any]) -> bool:
    uid = unit["id"]
    print(f"\n🎙️  [{uid[:8]}] {unit['title']}")

    update_unit_status(uid, audio_overview_status="generando")

    try:
        # 1. Crear notebook
        nb_name = f"Barkley · {unit['title'][:60]}"
        nb = await client.notebooks.create(nb_name)
        print(f"    📓 notebook: {nb.id}")

        # 2. Subir texto como source
        source_text = build_source_text(unit)
        print(f"    📄 texto: {len(source_text):,} chars")
        await client.sources.add_text(nb.id, unit["title"][:80], source_text, wait=True)

        # 3. Generar audio overview
        instructions = (
            f"Genera un podcast educativo en español chileno, conversacional, "
            f"de 8 a 12 minutos, para estudiantes de {(unit.get('courses') or {}).get('grade_level', '')}. "
            f"Dos voces que dialoguen, explicando los conceptos clave de esta unidad "
            f"con ejemplos cotidianos chilenos. Tono cercano y motivador."
        )
        status = await client.artifacts.generate_audio(nb.id, language="es", instructions=instructions)
        print(f"    ⏳ generando podcast (task {status.task_id})...")
        await client.artifacts.wait_for_completion(nb.id, status.task_id, timeout=1500.0, max_interval=30.0)
        print(f"    ✅ podcast listo")

        # 4. Descargar a temp file
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            await client.artifacts.download_audio(nb.id, tmp.name)
            tmp_path = Path(tmp.name)
        size_mb = tmp_path.stat().st_size / 1_000_000
        print(f"    ⬇  descargado: {size_mb:.1f} MB")

        # 5. Subir a Supabase Storage
        public_url = upload_mp3(uid, tmp_path)
        tmp_path.unlink()
        print(f"    ☁  subido: {public_url}")

        # 6. Actualizar DB
        from datetime import datetime, timezone
        update_unit_status(
            uid,
            audio_overview_url=public_url,
            audio_overview_status="listo",
            audio_overview_notebook_id=nb.id,
            audio_overview_generated_at=datetime.now(timezone.utc).isoformat(),
            audio_overview_error=None,
        )
        print(f"    💾 DB actualizada → status=listo")
        return True

    except Exception as e:
        err = f"{type(e).__name__}: {e}"
        print(f"    ❌ ERROR: {err}")
        update_unit_status(uid, audio_overview_status="fallido", audio_overview_error=err[:500])
        return False


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", help="Filtrar por grado (ej 4_basico)")
    ap.add_argument("--pilot", action="store_true", help="Solo 1 unidad (test)")
    ap.add_argument("--retry-failed", action="store_true", help="Solo unidades fallidas")
    ap.add_argument("--force", action="store_true", help="Regenerar incluso si ya tiene audio")
    args = ap.parse_args()

    units = fetch_units(
        grade=args.grade,
        only_pending=not args.force,
        pilot=args.pilot,
    )

    if not units:
        print("⚠ No hay unidades con contenido válido para procesar.")
        return

    print(f"\n🚀 Procesando {len(units)} unidad(es)\n")

    async with await NotebookLMClient.from_storage() as client:
        ok, fail = 0, 0
        for unit in units:
            success = await process_unit(client, unit)
            if success:
                ok += 1
            else:
                fail += 1
            # Pausa entre unidades para no gatillar rate limit
            await asyncio.sleep(5)

    print(f"\n{'─'*60}\n📊 RESULTADO: {ok} OK · {fail} fallidas · {len(units)} total\n{'─'*60}")


if __name__ == "__main__":
    asyncio.run(main())
