#!/usr/bin/env python3
"""Solo regenera flashcards en español."""
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
UNIT_ID = "af34df58-eca2-49bf-8bc9-9ce309979a8c"
NB_ID = "a6e5187d-9514-4b24-9ac5-4dcc1a989f90"

INSTRUCTIONS = (
    "OBLIGATORIO: TODAS las flashcards en ESPAÑOL DE CHILE. "
    "Tema: representar números 0-10 000, valor posicional, unidades de mil, centenas, decenas. "
    "Audiencia niños chilenos 9-10 años. "
    "Cada flashcard: pregunta corta al frente, respuesta clara atrás. "
    "Cero inglés. Si dudas, ESPAÑOL siempre. "
    "Ejemplos chilenos: pesos CLP, comunas, productos de la cuncuna."
)


async def main():
    async with NotebookLMClient.from_storage() as client:
        try:
            print("🃏 flashcards español...")
            st = await client.artifacts.generate_flashcards(NB_ID, instructions=INSTRUCTIONS)
            await client.artifacts.wait_for_completion(NB_ID, st.task_id, timeout=600, max_interval=15)
            with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_flashcards(NB_ID, str(tmp_path), output_format="json")
            data = json.loads(tmp_path.read_text())
            tmp_path.unlink()
            SB.table("units").update({
                "flashcards_json": data,
                "artifacts_generated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", UNIT_ID).execute()
            print(f"  ✅ guardado DB ({len(data.get('cards', data) if isinstance(data, dict) else data)} cards)")
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")


asyncio.run(main())
