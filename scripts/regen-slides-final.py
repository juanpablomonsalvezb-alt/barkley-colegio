#!/usr/bin/env python3
"""Último intento slides español."""
import asyncio, os, tempfile
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env.local"
for line in ENV.read_text().splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

from notebooklm import NotebookLMClient
from supabase import create_client

SB = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
UNIT_ID = "af34df58-eca2-49bf-8bc9-9ce309979a8c"
NB_ID = "a6e5187d-9514-4b24-9ac5-4dcc1a989f90"


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
        try:
            print("📊 slides español (timeout 40min)...")
            st = await client.artifacts.generate_slide_deck(
                NB_ID,
                language="es",
                instructions=(
                    "OBLIGATORIO: Todas las diapositivas en ESPAÑOL DE CHILE. "
                    "Títulos, subtítulos, bullets, captions, todo en español. "
                    "Cero palabras en inglés. Tema: números 0-10 000, valor posicional. "
                    "Audiencia: niños chilenos 9-10 años. Usa Sofía, Gaspar, Sami como personajes."
                ),
            )
            print(f"   task {st.task_id} esperando hasta 40 min...")
            await client.artifacts.wait_for_completion(NB_ID, st.task_id, timeout=2400, max_interval=30)
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_slide_deck(NB_ID, str(tmp_path))
            url = upload("unit-artifacts", f"{UNIT_ID}/slides.pdf", tmp_path, "application/pdf")
            tmp_path.unlink()
            SB.table("units").update({
                "slide_deck_url": url,
                "artifacts_generated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", UNIT_ID).execute()
            print(f"  ✅ {url}")
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")


asyncio.run(main())
