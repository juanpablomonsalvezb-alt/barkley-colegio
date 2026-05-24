#!/usr/bin/env python3
"""Re-genera flashcards + mindmap + slides FORZANDO 100% español."""
import asyncio, os, tempfile, json
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
ART_BUCKET = "unit-artifacts"
UNIT_ID = "af34df58-eca2-49bf-8bc9-9ce309979a8c"
NB_ID = "a6e5187d-9514-4b24-9ac5-4dcc1a989f90"

STRICT_ES = (
    "REGLA ABSOLUTA E INNEGOCIABLE: Genera el contenido COMPLETO en ESPAÑOL DE CHILE. "
    "Cero palabras en inglés. Cero 'fractions', 'multiplication', 'numbers', 'units of thousand'. "
    "USA: fracciones, multiplicación, números, unidades de mil, centena, decena, unidad. "
    "TODO el contenido visual, títulos, etiquetas, descripciones, conceptos y ejemplos en español. "
    "Audiencia: niños chilenos 9-10 años (4° básico). "
    "Si dudas del idioma, escribe en ESPAÑOL siempre. Verifica antes de generar: ¿está en español? Si no, traduce."
)


def upload(bucket, key, file_path, mime):
    try:
        SB.storage.from_(bucket).remove([key])
    except Exception:
        pass
    with open(file_path, "rb") as f:
        SB.storage.from_(bucket).upload(path=key, file=f.read(), file_options={"content-type": mime, "upsert": "true"})
    return SB.storage.from_(bucket).get_public_url(key)


async def main():
    async with NotebookLMClient.from_storage() as client:
        updates = {}

        # FLASHCARDS
        try:
            print("🃏 flashcards español...")
            st = await client.artifacts.generate_flashcards(NB_ID, language="es", instructions=STRICT_ES)
            await client.artifacts.wait_for_completion(NB_ID, st.task_id, timeout=600, max_interval=15)
            with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_flashcards(NB_ID, str(tmp_path), output_format="json")
            updates["flashcards_json"] = json.loads(tmp_path.read_text())
            tmp_path.unlink()
            print(f"  ✅ guardado DB")
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")

        # MIND MAP
        try:
            print("🧠 mind map español...")
            await client.artifacts.generate_mind_map(NB_ID, language="es", instructions=STRICT_ES)
            with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_mind_map(NB_ID, str(tmp_path))
            updates["mind_map_json"] = json.loads(tmp_path.read_text())
            tmp_path.unlink()
            print(f"  ✅ guardado DB")
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")

        # SLIDES (último intento)
        try:
            print("📊 slides español...")
            st = await client.artifacts.generate_slide_deck(NB_ID, language="es", instructions=STRICT_ES)
            await client.artifacts.wait_for_completion(NB_ID, st.task_id, timeout=1200, max_interval=20)
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_slide_deck(NB_ID, str(tmp_path))
            url = upload(ART_BUCKET, f"{UNIT_ID}/slides.pdf", tmp_path, "application/pdf")
            updates["slide_deck_url"] = url
            tmp_path.unlink()
            print(f"  ✅ {url}")
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")

        if updates:
            updates["artifacts_generated_at"] = datetime.now(timezone.utc).isoformat()
            SB.table("units").update(updates).eq("id", UNIT_ID).execute()
            print(f"\n💾 DB updateado: {list(updates.keys())}")


asyncio.run(main())
