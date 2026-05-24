#!/usr/bin/env python3
"""Regen mind map con prompt ultra-fuerte español + post-process traducción."""
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

# Diccionario de traducción para términos matemáticos básicos
TRANSLATE = {
    "Numbers": "Números",
    "Operations": "Operaciones",
    "Grade": "Básico",
    "Formation Rules": "Reglas de formación",
    "Place Value": "Valor posicional",
    "Place value": "Valor posicional",
    "Decomposition": "Descomposición",
    "Writing and Reading": "Escritura y lectura",
    "Reading and Writing": "Lectura y escritura",
    "Reading": "Lectura",
    "Writing": "Escritura",
    "Example": "Ejemplo",
    "Additive": "Aditiva",
    "Groupings": "Agrupaciones",
    "Groups": "Grupos",
    "Group": "Grupo",
    "Use of space": "Uso de espacio",
    "Identification": "Identificación",
    "Identifying": "Identificar",
    "Counting": "Conteo",
    "Comparing": "Comparación",
    "Ordering": "Orden",
    "Up to": "Hasta",
    "Hundred": "Centena",
    "Hundreds": "Centenas",
    "Ten": "Decena",
    "Tens": "Decenas",
    "Unit": "Unidad",
    "Units": "Unidades",
    "Thousand": "Mil",
    "Thousands": "Miles",
    "Equal to": "Igual a",
    "Equivalent": "Equivalente",
    "Whole numbers": "Números enteros",
    "Whole Numbers": "Números enteros",
    "Properties": "Propiedades",
    "Symbols": "Símbolos",
    "Concepts": "Conceptos",
    "Key Concepts": "Conceptos clave",
    "Main Topics": "Temas principales",
    "Overview": "Visión general",
    "Summary": "Resumen",
    "Definition": "Definición",
    "Definitions": "Definiciones",
    "Strategies": "Estrategias",
    "Strategy": "Estrategia",
    "Methods": "Métodos",
    "Method": "Método",
    "Examples": "Ejemplos",
    "Practice": "Práctica",
    "Application": "Aplicación",
    "Real-world": "Mundo real",
    "Mathematics": "Matemática",
    "Math": "Matemática",
    "1st": "1°",
    "2nd": "2°",
    "3rd": "3°",
    "4th": "4°",
    "5th": "5°",
    "6th": "6°",
    "7th": "7°",
    "8th": "8°",
}


def translate_text(text: str) -> str:
    """Reemplaza términos en inglés por español respetando word boundaries."""
    import re
    result = text
    # Word boundaries reales con regex
    for en, es in sorted(TRANSLATE.items(), key=lambda x: -len(x[0])):
        # \b boundaries + case insensitive
        result = re.sub(rf"\b{re.escape(en)}\b", es, result, flags=re.IGNORECASE)
    # Conectores comunes restantes
    result = re.sub(r"\band\b", "y", result, flags=re.IGNORECASE)
    result = re.sub(r"\bor\b", "o", result, flags=re.IGNORECASE)
    result = re.sub(r"\bof\b", "de", result, flags=re.IGNORECASE)
    result = re.sub(r"\bthe\b", "", result, flags=re.IGNORECASE)
    result = re.sub(r"\bfor\b", "para", result, flags=re.IGNORECASE)
    result = re.sub(r"\bwith\b", "con", result, flags=re.IGNORECASE)
    result = re.sub(r"\bup to\b", "hasta", result, flags=re.IGNORECASE)
    # Limpia espacios dobles
    result = re.sub(r"\s+", " ", result).strip()
    return result


def translate_tree(node):
    """Recursivamente traduce labels del árbol."""
    if isinstance(node, dict):
        if "name" in node:
            node["name"] = translate_text(node["name"])
        if "label" in node:
            node["label"] = translate_text(node["label"])
        for k, v in node.items():
            if isinstance(v, (dict, list)):
                translate_tree(v)
    elif isinstance(node, list):
        for item in node:
            translate_tree(item)


async def main():
    async with NotebookLMClient.from_storage() as client:
        try:
            print("🧠 mind map español ultra-strict...")
            await client.artifacts.generate_mind_map(
                NB_ID,
                language="es",
                instructions=(
                    "GENERA TODO EN ESPAÑOL. Cero inglés. "
                    "Usa estos términos chilenos: Números y Operaciones, "
                    "Valor posicional, Unidades de mil, Centenas, Decenas, Unidades, "
                    "Descomposición, Lectura, Escritura, Comparación, Orden, Ejemplos, "
                    "Conteo, Conceptos clave, Reglas. NUNCA escribas 'Numbers', 'Place Value', "
                    "'Hundreds', 'Tens', 'Units', 'Reading', 'Writing'. SIEMPRE en español."
                ),
            )
            with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
                tmp_path = Path(tmp.name)
            await client.artifacts.download_mind_map(NB_ID, str(tmp_path))
            data = json.loads(tmp_path.read_text())
            tmp_path.unlink()

            # Post-process: traducir cualquier residuo en inglés
            print("  🔧 traduciendo residuos en inglés...")
            translate_tree(data)

            SB.table("units").update({
                "mind_map_json": data,
                "artifacts_generated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", UNIT_ID).execute()
            print(f"  ✅ guardado en DB")
            print(json.dumps(data, indent=2, ensure_ascii=False)[:600])
        except Exception as e:
            print(f"  ❌ {type(e).__name__}: {e}")


asyncio.run(main())
