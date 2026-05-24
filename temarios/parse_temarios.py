#!/usr/bin/env python3
"""Parse MINEDUC Chile temarios markdown files into structured JSON."""
import json
import re
import unicodedata
from pathlib import Path
from datetime import date

BASE = Path("/Users/juanpablomonsalvez/Downloads/barkley/temarios")

GRADE_FILES = [
    ("1_basico", "1° Básico", "temario_basica_1deg_basico_uce_1.md", "01"),
    ("2_basico", "2° Básico", "temario_basica_2deg_basico_uce_1.md", "02"),
    ("3_basico", "3° Básico", "temario_basica_3deg_basico_uce_1.md", "03"),
    ("4_basico", "4° Básico", "temario_basica_4deg_basico_uce_3.md", "04"),
    ("5_basico", "5° Básico", "temario_basica_5deg_basico_uce_1.md", "05"),
    ("6_basico", "6° Básico", "temario_basica_6deg_basico_uce_1.md", "06"),
    ("7_basico", "7° Básico", "temario_basica_7deg_basico_uce_2.md", "07"),
    ("8_basico", "8° Básico", "temario_basica_8deg_basico_uce_2.md", "08"),
    ("1_medio",  "1° Medio",  "temario_media_1deg_medio_uce_1.md",  "09"),
    ("2_medio",  "2° Medio",  "temario_media_2deg_medio_uce_1.md",  "10"),
    ("3_medio",  "3° Medio",  "temario_media_3deg_medio_uce_2.md",  "11"),
    ("4_medio",  "4° Medio",  "temario_media_4deg_medio_uce_2.md",  "12"),
]

# Subject name normalization → (canonical_name, key, prefix)
SUBJECT_PATTERNS = [
    (r"^lenguaje\s*y\s*comunicaci[oó]n", "Lenguaje y Comunicación", "lenguaje_y_comunicacion", "LE"),
    (r"^lengua\s*y\s*literatura", "Lengua y Literatura", "lengua_y_literatura", "LE"),
    (r"^matem[aá]ticas?", "Matemática", "matematica", "MA"),
    (r"^ciencias\s*naturales", "Ciencias Naturales", "ciencias_naturales", "CN"),
    (r"^ciencias?\s*para\s*la\s*ciudadan[ií]a", "Ciencias para la Ciudadanía", "ciencias_para_la_ciudadania", "CC"),
    (r"^historia,?\s*geograf[ií]a\s*y\s*ciencias\s*sociales", "Historia, Geografía y Ciencias Sociales", "historia_geografia_y_ciencias_sociales", "HI"),
    (r"^historia$", "Historia, Geografía y Ciencias Sociales", "historia_geografia_y_ciencias_sociales", "HI"),
    (r"^ingl[eé]s", "Inglés", "ingles", "IN"),
    (r"^filosof[ií]a", "Filosofía", "filosofia", "FL"),
    (r"^educaci[oó]n\s*ciudadana", "Educación Ciudadana", "educacion_ciudadana", "EC"),
    (r"^f[ií]sica$", "Física", "fisica", "FI"),
    (r"^qu[ií]mica$", "Química", "quimica", "QU"),
    (r"^biolog[ií]a$", "Biología", "biologia", "BI"),
]

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def clean_lines(text):
    """Remove pure table noise lines and collapse pipe artifacts within lines."""
    out = []
    for raw in text.splitlines():
        line = raw.rstrip()
        # Drop pure separator lines
        stripped = line.strip()
        if not stripped:
            out.append("")
            continue
        # Drop lines that are only table separators
        if re.fullmatch(r"[\|\s\-:]+", stripped):
            continue
        # Drop lines that are just empty pipe cells like "|     |     |"
        if re.fullmatch(r"(\|\s*)+\|?", stripped):
            continue
        # Remove leading/trailing pipes; collapse internal pipe-separated empty cells into spaces
        # Replace pipe-empty-cell sequences with single space, keep content
        line = re.sub(r"\|", " ", line)
        # Collapse multiple spaces
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            out.append(line)
    return "\n".join(out)

def remove_headers_footers(text):
    """Remove repeating page headers/footers like 'Temario X Y de Z' and 'Página N de M'."""
    text = re.sub(r"Temario\s+[A-Za-zÁÉÍÓÚáéíóúñÑ]+\s+(Básico|Medio)\s*\d+\s*de\s*\d+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Temario\s+[A-Za-zÁÉÍÓÚáéíóúñÑ]+\s+(Básico|Medio)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"P[aá]gina\s+\d+\s+de\s+\d+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^\s*\d+\s+de\s+\d+\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"Objetivos\s+de\s+Aprendizaje\s+OA\s+Indicadores\s+de\s+Evaluaci[oó]n", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Objetivos\s+de\s+Aprendizaje\s+Indicadores\s+de\s+Evaluaci[oó]n", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Objetivos\s+de\s+Aprendizaje\s+OA", "", text, flags=re.IGNORECASE)
    text = re.sub(r"Indicadores\s+de\s+Evaluaci[oó]n", "", text, flags=re.IGNORECASE)
    return text

def find_instructions_end(text):
    """Find where 'Instrucciones generales' block ends — first subject header marks the start of content."""
    return 0  # We'll parse using subject headers anyway

def match_subject(line):
    """Return (canonical, key, prefix) if line is a subject header, else None."""
    # Normalize: strip underscores, asterisks, bullets
    raw = line.strip()
    raw = re.sub(r"[_\*•·●]+", "", raw).strip()
    if not raw or len(raw) > 80:
        return None
    low = raw.lower()
    for pat, canon, key, pref in SUBJECT_PATTERNS:
        if re.match(pat + r"\s*$", low):
            return (canon, key, pref)
    return None

def find_subject_positions(cleaned_text):
    """Find positions where subject sections start."""
    positions = []
    lines = cleaned_text.split("\n")
    offset = 0
    for line in lines:
        m = match_subject(line)
        if m:
            positions.append((offset, m, line))
        offset += len(line) + 1
    return positions

OA_PATTERN = re.compile(
    r"Objetivo\s+de\s+Aprendizaje\s+N?\s*°?\s*(\d{1,3})\s*:?",
    re.IGNORECASE
)

def parse_oa_block(block_text):
    """Given the text after an OA marker (until next OA or subject), split into description and indicators."""
    # Indicators usually start with " -  " or "- " at line start, or " •  " bullets
    # Many lines mix OA description text and indicator bullets due to table mangling.
    # Strategy: collect all bullet lines (starting with - or • or ●), then everything else (non-bullet) is description.

    lines = [l.strip() for l in block_text.split("\n") if l.strip()]

    # Two-pass classification:
    # - Lines starting with "-" / "–" / "—" → start a new indicator
    # - Lines starting with "•" / "●" / "·" → OA description sub-bullet
    # - Other prose lines → description (or continuation of preceding indicator/description)
    desc_parts = []
    indicators = []
    current_indicator = None
    last_kind = None  # 'desc' or 'ind'

    for line in lines:
        if re.fullmatch(r"[\d\s\.]+", line):
            continue
        ind_match = re.match(r"^[-–—]\s+(.*)", line)
        sub_match = re.match(r"^[•·●]\s+(.*)", line)

        if ind_match:
            if current_indicator:
                indicators.append(current_indicator.strip())
            current_indicator = ind_match.group(1).strip()
            last_kind = 'ind'
        elif sub_match:
            content = sub_match.group(1).strip()
            first_word = content.split()[0].lower().rstrip(',.:;') if content else ""
            # Heuristic: gerund (-ando/-iendo/-yendo) or infinitive verb-like → OA description sub-bullet
            # 3rd person plural present (-an/-en) describing observable student behavior → indicator
            is_indicator = False
            if re.match(r"^(identifican|reconocen|aplican|resuelven|comparan|ordenan|componen|descomponen|representan|relacionan|explican|describen|escriben|leen|interpretan|construyen|extraen|formulan|evalúan|evaluan|seleccionan|infieren|opinan|fundamentan|caracterizan|distinguen|localizan|mencionan|nombran|asocian|clasifican|completan|continúan|continuan|crean|registran|dan|comprenden|usan|utilizan|determinan|estiman|expresan|calculan|miden|grafican|argumentan|comunican|demuestran|sintetizan|establecen|analizan|elaboran|producen)\b", first_word):
                is_indicator = True
            elif re.match(r".*(ando|iendo|yendo)$", first_word):
                is_indicator = False
            else:
                # Fallback: if we're already past OA description (saw indicators), treat as indicator
                is_indicator = (last_kind == 'ind')

            if is_indicator:
                if current_indicator:
                    indicators.append(current_indicator.strip())
                current_indicator = content
                last_kind = 'ind'
            else:
                if current_indicator:
                    indicators.append(current_indicator.strip())
                    current_indicator = None
                desc_parts.append("• " + content)
                last_kind = 'desc'
        else:
            # Plain prose line. Decide: continuation or new description?
            # Heuristic: starts with capital letter or a known OA verb → likely new description chunk
            starts_capital = bool(re.match(r"^[A-ZÁÉÍÓÚÑ]", line))
            looks_like_desc_lead = bool(re.match(r"^(Leer|Identificar|Demostrar|Reconocer|Comparar|Analizar|Describir|Explicar|Resolver|Aplicar|Formular|Producir|Componer|Determinar|Experimentar|Observar|Secuenciar|Conocer|Escribir|Calcular|Modelar|Representar|Argumentar|Evaluar|Investigar|Clasificar|Dialogar|Comprender|Comunicar|Caracterizar)", line))
            if last_kind == 'ind' and not (starts_capital and (looks_like_desc_lead or len(line) > 40)):
                # continuation of indicator
                current_indicator = (current_indicator or "") + " " + line
            else:
                # new description prose, flush current indicator
                if current_indicator:
                    indicators.append(current_indicator.strip())
                    current_indicator = None
                desc_parts.append(line)
                last_kind = 'desc'

    if current_indicator:
        indicators.append(current_indicator.strip())

    # Clean
    description = " ".join(desc_parts).strip()
    description = re.sub(r"\s+", " ", description)
    indicators = [re.sub(r"\s+", " ", i).strip() for i in indicators if i.strip()]
    # Remove indicators that are just numbers/noise
    indicators = [i for i in indicators if len(i) > 3 and not re.fullmatch(r"[\d\s\.,]+", i)]

    return description, indicators

def parse_subject_block(subject_text, prefix, grade_code):
    """Parse a subject's text block into description, ejes, and OA list."""
    # Find OAs
    oa_matches = list(OA_PATTERN.finditer(subject_text))

    # Description = text before first OA
    if oa_matches:
        description_raw = subject_text[:oa_matches[0].start()].strip()
    else:
        description_raw = subject_text.strip()

    # Clean description — keep only meaningful prose lines (start with • or letter, not table noise)
    desc_lines = []
    for ln in description_raw.split("\n"):
        s = ln.strip()
        if not s:
            continue
        if len(s) < 4:
            continue
        desc_lines.append(s)
    description = " ".join(desc_lines).strip()
    description = re.sub(r"\s+", " ", description)
    # Trim description to a reasonable length
    if len(description) > 2000:
        description = description[:2000].rsplit(" ", 1)[0] + "..."

    # Extract ejes from description heuristically
    ejes = extract_ejes(description)

    # Parse each OA
    oas = []
    for i, m in enumerate(oa_matches):
        oa_num = int(m.group(1))
        start = m.end()
        end = oa_matches[i+1].start() if i+1 < len(oa_matches) else len(subject_text)
        block = subject_text[start:end]
        desc, indicators = parse_oa_block(block)
        if not desc:
            continue
        oas.append({
            "oa_number": oa_num,
            "oa_code": f"{prefix}{grade_code}-OA{oa_num:02d}",
            "description": desc,
            "eje": None,
            "indicadores": indicators,
        })

    # Dedup by oa_number (keep longest description)
    by_num = {}
    for oa in oas:
        if oa["oa_number"] not in by_num or len(oa["description"]) > len(by_num[oa["oa_number"]]["description"]):
            by_num[oa["oa_number"]] = oa
    oas = sorted(by_num.values(), key=lambda x: x["oa_number"])

    return description, ejes, oas

def extract_ejes(description):
    """Heuristically extract eje names from subject description."""
    ejes = []
    # Pattern: "ejes: X, Y y Z" or "ejes: X; Y; Z"
    m = re.search(r"ejes?\s*:\s*([^\.]+?)(?:\.|$)", description, re.IGNORECASE)
    if m:
        chunk = m.group(1)
        # Split by , ; y/e
        parts = re.split(r"[,;]|\s+y\s+|\s+e\s+", chunk)
        ejes = [p.strip().rstrip(".") for p in parts if 2 < len(p.strip()) < 60]
    # Also try "tres ejes temáticos: X, Y y Z"
    if not ejes:
        m = re.search(r"ejes\s+tem[aá]ticos:\s*([^\.]+?)(?:\.|$)", description, re.IGNORECASE)
        if m:
            chunk = m.group(1)
            parts = re.split(r"[,;]|\s+y\s+|\s+e\s+", chunk)
            ejes = [p.strip().rstrip(".") for p in parts if 2 < len(p.strip()) < 60]
    return ejes

def parse_file(filepath, grade_code):
    text = filepath.read_text(encoding="utf-8")
    text = clean_lines(text)
    text = remove_headers_footers(text)
    # Re-collapse whitespace per line again
    text = "\n".join(re.sub(r"\s+", " ", ln).strip() for ln in text.split("\n"))

    # Find subject positions
    subj_positions = find_subject_positions(text)
    if not subj_positions:
        return {}

    subjects = {}
    for idx, (pos, (canon, key, pref), header_line) in enumerate(subj_positions):
        # subject section starts after this line
        # Find start of next line
        start = pos + len(header_line) + 1
        end = subj_positions[idx+1][0] if idx+1 < len(subj_positions) else len(text)
        section = text[start:end]
        desc, ejes, oas = parse_subject_block(section, pref, grade_code)
        # If key already exists (duplicate), merge OAs
        if key in subjects:
            existing = subjects[key]
            existing_nums = {o["oa_number"] for o in existing["objetivos_aprendizaje"]}
            for o in oas:
                if o["oa_number"] not in existing_nums:
                    existing["objetivos_aprendizaje"].append(o)
            existing["objetivos_aprendizaje"].sort(key=lambda x: x["oa_number"])
        else:
            subjects[key] = {
                "subject_name": canon,
                "description": desc,
                "ejes": ejes,
                "objetivos_aprendizaje": oas,
            }
    return subjects

def main():
    manifest = {
        "version": "1.0",
        "source": "MINEDUC Chile - Exámenes de Validación de Estudios para Menores de Edad",
        "generated_at": str(date.today()),
        "grades": {},
    }

    oa_per_grade = {}
    unique_subjects = set()
    total_oa = 0

    for grade_key, grade_label, filename, grade_code in GRADE_FILES:
        fp = BASE / filename
        if not fp.exists():
            print(f"MISSING: {fp}")
            continue
        subjects = parse_file(fp, grade_code)
        grade_oa = sum(len(s["objetivos_aprendizaje"]) for s in subjects.values())
        oa_per_grade[grade_key] = grade_oa
        total_oa += grade_oa
        for k in subjects.keys():
            unique_subjects.add(k)
        manifest["grades"][grade_key] = {
            "grade_label": grade_label,
            "subjects": subjects,
        }
        print(f"  {grade_key}: {len(subjects)} subjects, {grade_oa} OAs")

    manifest["summary"] = {
        "total_grades": len(manifest["grades"]),
        "total_subjects_unique": len(unique_subjects),
        "total_oa_count": total_oa,
        "oa_count_per_grade": oa_per_grade,
        "unique_subject_keys": sorted(unique_subjects),
    }

    out = BASE / "manifest.json"
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {out}")
    print(f"Total OAs: {total_oa}")
    print(f"Unique subjects: {sorted(unique_subjects)}")

if __name__ == "__main__":
    main()
