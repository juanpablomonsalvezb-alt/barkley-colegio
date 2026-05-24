#!/usr/bin/env python3
"""Re-genera video + slides forzando español en visuals."""
import asyncio, os, tempfile
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

INSTRUCTIONS_ES = (
    "OBLIGATORIO: TODO el contenido visual, títulos, subtítulos, "
    "etiquetas, gráficos, diagramas, texto en pantalla, narración y subtítulos "
    "deben estar 100% en ESPAÑOL DE CHILE. NO uses palabras en inglés. "
    "Audiencia: estudiantes 4° básico chilenos, 9-10 años. Tono cercano y motivador. "
    "Usa ejemplos chilenos: pesos CLP, comunas (Aysén, Puente Alto, La Florida), "
    "objetos cotidianos chilenos (mochila, cuaderno, micro, sopaipilla). "
    "Tema: representar y describir números del 0 al 10 000 usando valor posicional."
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

        # VIDEO
        try:
            print("🎬 video (forzando español)...")
            st = await client.artifacts.generate_video(NB_ID, language="es", instructions=INSTRUCTIONS_ES)
            await client.artifacts.wait_for_completion(NB_ID, st.task_id, timeout=2400, max_interval=30)
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_video(NB_ID, str(tmp_path))
            url = upload(ART_BUCKET, f"{UNIT_ID}/video.mp4", tmp_path, "video/mp4")
            updates["video_overview_url"] = url
            tmp_path.unlink()
            print(f"  ✅ {url}")
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")

        # SLIDES
        try:
            print("📊 slides (forzando español)...")
            st = await client.artifacts.generate_slide_deck(NB_ID, language="es", instructions=INSTRUCTIONS_ES)
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
