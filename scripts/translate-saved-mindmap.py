#!/usr/bin/env python3
"""Traduce solo el mindmap ya guardado en DB (sin volver a llamar NotebookLM)."""
import os, json, re
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / ".env.local"
for line in ENV.read_text().splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

from supabase import create_client
SB = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
UNIT_ID = "af34df58-eca2-49bf-8bc9-9ce309979a8c"

TRANSLATE = {
    "Numbers": "Números", "Operations": "Operaciones", "Grade": "Básico",
    "Formation Rules": "Reglas de formación", "Place Value": "Valor posicional",
    "Decomposition": "Descomposición", "Writing": "Escritura", "Reading": "Lectura",
    "Example": "Ejemplo", "Additive": "Aditiva", "Groupings": "Agrupaciones",
    "Use of space": "Uso de espacio", "Identification": "Identificación",
    "Counting": "Conteo", "Comparing": "Comparación", "Ordering": "Orden",
    "Hundred": "Centena", "Hundreds": "Centenas", "Ten": "Decena", "Tens": "Decenas",
    "Unit": "Unidad", "Units": "Unidades", "Thousand": "Mil", "Thousands": "Miles",
    "Whole numbers": "Números enteros", "Properties": "Propiedades",
    "Symbols": "Símbolos", "Concepts": "Conceptos", "Key Concepts": "Conceptos clave",
    "Main Topics": "Temas principales", "Overview": "Visión general",
    "Summary": "Resumen", "Definition": "Definición", "Strategies": "Estrategias",
    "Methods": "Métodos", "Examples": "Ejemplos", "Practice": "Práctica",
    "Application": "Aplicación", "Real-world": "Mundo real",
    "Mathematics": "Matemática", "Math": "Matemática",
    "1st": "1°", "2nd": "2°", "3rd": "3°", "4th": "4°", "5th": "5°",
    "6th": "6°", "7th": "7°", "8th": "8°",
    "Step": "Paso", "Steps": "Pasos",
    "Comparison": "Comparación", "Order": "Orden",
}


def tr(text: str) -> str:
    r = text
    for en, es in sorted(TRANSLATE.items(), key=lambda x: -len(x[0])):
        r = re.sub(rf"\b{re.escape(en)}\b", es, r, flags=re.IGNORECASE)
    r = re.sub(r"\band\b", "y", r, flags=re.IGNORECASE)
    r = re.sub(r"\bor\b", "o", r, flags=re.IGNORECASE)
    r = re.sub(r"\bof\b", "de", r, flags=re.IGNORECASE)
    r = re.sub(r"\bthe\b", "", r, flags=re.IGNORECASE)
    r = re.sub(r"\bfor\b", "para", r, flags=re.IGNORECASE)
    r = re.sub(r"\bwith\b", "con", r, flags=re.IGNORECASE)
    r = re.sub(r"\bup to\b", "hasta", r, flags=re.IGNORECASE)
    r = re.sub(r"\bare\b", "son", r, flags=re.IGNORECASE)
    r = re.sub(r"\bis\b", "es", r, flags=re.IGNORECASE)
    r = re.sub(r"\bin\b", "en", r, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", r).strip()


def walk(node):
    if isinstance(node, dict):
        if "name" in node and isinstance(node["name"], str):
            node["name"] = tr(node["name"])
        if "label" in node and isinstance(node["label"], str):
            node["label"] = tr(node["label"])
        for v in node.values():
            walk(v)
    elif isinstance(node, list):
        for item in node:
            walk(item)


r = SB.table("units").select("mind_map_json").eq("id", UNIT_ID).single().execute()
mm = r.data.get("mind_map_json")
if not mm:
    print("Sin mind_map_json en DB")
    raise SystemExit(1)

walk(mm)
SB.table("units").update({
    "mind_map_json": mm,
    "artifacts_generated_at": datetime.now(timezone.utc).isoformat(),
}).eq("id", UNIT_ID).execute()
print("✅ mindmap traducido:")
print(json.dumps(mm, indent=2, ensure_ascii=False)[:1500])
