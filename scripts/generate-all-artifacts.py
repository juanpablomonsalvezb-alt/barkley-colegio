#!/usr/bin/env python3
"""
Genera TODOS los artifacts NotebookLM por unidad: audio, video, slide deck,
infografía, mind map, flashcards, study guide.

Uso:
    python3 scripts/generate-all-artifacts.py --pilot
    python3 scripts/generate-all-artifacts.py --unit <unit_id>
    python3 scripts/generate-all-artifacts.py --grade 4_basico
"""
from __future__ import annotations
import argparse, asyncio, os, re, sys, tempfile
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env.local"
if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

from notebooklm import NotebookLMClient
from supabase import create_client

SB = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
AUDIO_BUCKET = "audio-overviews"
ART_BUCKET = "unit-artifacts"


def fetch_units(grade=None, unit_id=None, pilot=False):
    q = SB.table("units").select(
        "id, title, description, audio_overview_status, audio_overview_notebook_id, "
        "courses(grade_level, subjects(name)), "
        "lessons(id, title, content_html, is_published)"
    )
    if grade:
        q = q.eq("courses.grade_level", grade)
    if unit_id:
        q = q.eq("id", unit_id)
    units = q.execute().data or []
    filtered = []
    for u in units:
        valid = [l for l in (u.get("lessons") or []) if l.get("content_html") and "placeholder" not in l["content_html"].lower()]
        if valid:
            u["valid_lessons"] = valid
            filtered.append(u)
    return filtered[:1] if pilot else filtered


def build_text(unit):
    course = unit.get("courses") or {}
    subj = (course.get("subjects") or {}).get("name", "")
    parts = [f"# {unit['title']}", f"Asignatura: {subj}", f"Curso: {course.get('grade_level', '')}\n"]
    for i, l in enumerate(unit["valid_lessons"], 1):
        parts.append(f"\n## Lección {i}: {l['title']}\n")
        text = re.sub(r"<[^>]+>", " ", l["content_html"] or "")
        parts.append(re.sub(r"\s+", " ", text).strip())
    return "\n".join(parts)


def upload(bucket, key, file_path, mime):
    try:
        SB.storage.from_(bucket).remove([key])
    except Exception:
        pass
    with open(file_path, "rb") as f:
        SB.storage.from_(bucket).upload(path=key, file=f.read(), file_options={"content-type": mime, "upsert": "true"})
    return SB.storage.from_(bucket).get_public_url(key)


def update_unit(unit_id, **kwargs):
    SB.table("units").update(kwargs).eq("id", unit_id).execute()


async def get_or_create_notebook(client, unit):
    """Reusa notebook existente si ya tiene audio."""
    if unit.get("audio_overview_notebook_id"):
        try:
            nb = await client.notebooks.get(unit["audio_overview_notebook_id"])
            print(f"    ♻️  reusando notebook {nb.id[:8]}")
            return nb
        except Exception:
            pass
    nb = await client.notebooks.create(f"Barkley · {unit['title'][:60]}")
    text = build_text(unit)
    print(f"    📓 nuevo notebook {nb.id[:8]} · {len(text):,} chars")
    await client.sources.add_text(nb.id, unit["title"][:80], text, wait=True)
    return nb


async def gen_audio(client, nb_id, lang_hint=""):
    print("    🎙️  audio overview...")
    st = await client.artifacts.generate_audio(
        nb_id, language="es",
        instructions=f"Podcast educativo español chileno conversacional 2 voces 8-12 min{lang_hint}",
    )
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=1500, max_interval=30)
    return st


async def gen_video(client, nb_id):
    print("    🎬 video overview...")
    st = await client.artifacts.generate_video(
        nb_id,
        instructions="Video explicativo estilo whiteboard, español chileno, para estudiantes 4° básico, 5-8 min",
    )
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=2400, max_interval=30)
    return st


async def gen_slides(client, nb_id):
    print("    📊 slide deck...")
    st = await client.artifacts.generate_slide_deck(nb_id)
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=1200, max_interval=20)
    return st


async def gen_infographic(client, nb_id):
    print("    🖼️  infografía...")
    st = await client.artifacts.generate_infographic(nb_id)
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=900, max_interval=20)
    return st


async def gen_mind_map(client, nb_id):
    print("    🧠 mind map...")
    st = await client.artifacts.generate_mind_map(nb_id)
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=600, max_interval=15)
    return st


async def gen_flashcards(client, nb_id):
    print("    🃏 flashcards...")
    st = await client.artifacts.generate_flashcards(nb_id)
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=600, max_interval=15)
    return st


async def gen_study_guide(client, nb_id):
    print("    📘 study guide...")
    st = await client.artifacts.generate_study_guide(nb_id)
    await client.artifacts.wait_for_completion(nb_id, st.task_id, timeout=600, max_interval=15)
    return st


async def process(client, unit, skip_audio=False):
    uid = unit["id"]
    print(f"\n🎯 [{uid[:8]}] {unit['title']}")
    nb = await get_or_create_notebook(client, unit)
    updates = {"audio_overview_notebook_id": nb.id}

    async def safe(name, fn, dl_fn, ext, mime, bucket=ART_BUCKET, url_col=None, json_col=None):
        try:
            await fn(client, nb.id)
            with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            if json_col:
                # mind_map/flashcards descargan JSON directamente
                await dl_fn(nb.id, str(tmp_path))
                import json
                data = json.loads(tmp_path.read_text())
                updates[json_col] = data
                tmp_path.unlink()
                print(f"      ✅ {name} → DB JSON")
            else:
                await dl_fn(nb.id, str(tmp_path))
                key = f"{uid}/{name}.{ext}"
                url = upload(bucket, key, tmp_path, mime)
                updates[url_col] = url
                tmp_path.unlink()
                print(f"      ✅ {name} → {url}")
        except Exception as e:
            print(f"      ⚠ {name} falló: {type(e).__name__}: {str(e)[:120]}")

    if not skip_audio:
        try:
            await gen_audio(client, nb.id)
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_audio(nb.id, str(tmp_path))
            url = upload(AUDIO_BUCKET, f"{uid}.mp3", tmp_path, "audio/mpeg")
            tmp_path.unlink()
            updates["audio_overview_url"] = url
            updates["audio_overview_status"] = "listo"
            updates["audio_overview_generated_at"] = datetime.now(timezone.utc).isoformat()
            print(f"      ✅ audio → {url}")
        except Exception as e:
            print(f"      ⚠ audio falló: {e}")

    await safe("video", gen_video, client.artifacts.download_video, "mp4", "video/mp4", url_col="video_overview_url")
    await safe("slides", gen_slides, client.artifacts.download_slide_deck, "pdf", "application/pdf", url_col="slide_deck_url")
    await safe("infographic", gen_infographic, client.artifacts.download_infographic, "png", "image/png", url_col="infographic_url")
    await safe("mindmap", gen_mind_map, client.artifacts.download_mind_map, "json", "application/json", json_col="mind_map_json")
    await safe("flashcards", gen_flashcards, lambda nb_id, p: client.artifacts.download_flashcards(nb_id, p, output_format="json"), "json", "application/json", json_col="flashcards_json")
    try:
        # study guide es report custom — generamos como report markdown
        st = await client.artifacts.generate_report(nb.id, format="study-guide")
        await client.artifacts.wait_for_completion(nb.id, st.task_id, timeout=600, max_interval=15)
        with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as tmp:
            tmp_path = Path(tmp.name)
        await client.artifacts.download_report(nb.id, str(tmp_path))
        updates["study_guide_md"] = tmp_path.read_text()
        tmp_path.unlink()
        print("      ✅ study guide → DB MD")
    except Exception as e:
        print(f"      ⚠ study guide falló: {type(e).__name__}: {str(e)[:120]}")

    updates["artifacts_generated_at"] = datetime.now(timezone.utc).isoformat()
    update_unit(uid, **updates)
    print(f"    💾 DB actualizada")


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade")
    ap.add_argument("--unit")
    ap.add_argument("--pilot", action="store_true")
    ap.add_argument("--skip-audio", action="store_true", help="No regenerar audio (si ya está listo)")
    args = ap.parse_args()

    units = fetch_units(grade=args.grade, unit_id=args.unit, pilot=args.pilot)
    if not units:
        print("⚠ Sin unidades válidas.")
        return
    print(f"\n🚀 Procesando {len(units)} unidad(es)\n")

    async with NotebookLMClient.from_storage() as client:
        for u in units:
            await process(client, u, skip_audio=args.skip_audio)
            await asyncio.sleep(5)

    print("\n✅ Listo")


if __name__ == "__main__":
    asyncio.run(main())
