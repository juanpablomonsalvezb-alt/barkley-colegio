# Temarios MINEDUC Chile — Manifest Resumen

**Generado**: 2026-05-24
**Fuente**: Exámenes de Validación de Estudios para Menores de Edad (MINEDUC, Unidad de Currículum y Evaluación)
**Output**: `/Users/juanpablomonsalvez/Downloads/barkley/temarios/manifest.json`
**Parser**: `/Users/juanpablomonsalvez/Downloads/barkley/temarios/parse_temarios.py`

## Resumen por grado

| Grado | Asignaturas | OA totales |
|---|---|---|
| 1° Básico | 4 | 27 |
| 2° Básico | 5 | 33 |
| 3° Básico | 4 | 29 |
| 4° Básico | 4 | 32 |
| 5° Básico | 4 | 41 |
| 6° Básico | 4 | 41 |
| 7° Básico | 4 | 36 |
| 8° Básico | 4 | 39 |
| 1° Medio | 4 | 39 |
| 2° Medio | 4 | 36 |
| 3° Medio | 5 | 19 |
| 4° Medio | 6 | 19 |
| **TOTAL** | | **391** |

## Asignaturas únicas detectadas (10)

| Key | Nombre canónico | Prefijo OA |
|---|---|---|
| `lenguaje_y_comunicacion` | Lenguaje y Comunicación (1° básico – 6° básico) | LE |
| `lengua_y_literatura` | Lengua y Literatura (7° básico – 4° medio) | LE |
| `matematica` | Matemática | MA |
| `ciencias_naturales` | Ciencias Naturales (1° básico – 2° medio) | CN |
| `ciencias_para_la_ciudadania` | Ciencias para la Ciudadanía (3° y 4° medio) | CC |
| `historia_geografia_y_ciencias_sociales` | Historia, Geografía y Ciencias Sociales | HI |
| `ingles` | Inglés (5° básico en adelante) | IN |
| `filosofia` | Filosofía (3° y 4° medio) | FL |
| `educacion_ciudadana` | Educación Ciudadana (3° y 4° medio) | EC |
| `fisica` | Física (donde aplique) | FI |

**Nota**: Lenguaje y Comunicación pasa a llamarse Lengua y Literatura a partir de 7° básico (Decreto Bases Curriculares N°614 de 2013). Ambas comparten prefijo `LE` para mantener continuidad por grado.

## Formato del JSON

```json
{
  "version": "1.0",
  "source": "...",
  "generated_at": "2026-05-24",
  "grades": {
    "1_basico": {
      "grade_label": "1° Básico",
      "subjects": {
        "lenguaje_y_comunicacion": {
          "subject_name": "Lenguaje y Comunicación",
          "description": "...",
          "ejes": ["Lectura", "Escritura"],
          "objetivos_aprendizaje": [
            {
              "oa_number": 3,
              "oa_code": "LE01-OA03",
              "description": "...",
              "eje": null,
              "indicadores": ["...", "..."]
            }
          ]
        }
      }
    }
  },
  "summary": { ... }
}
```

## Naming convention de `oa_code`

`<PREFIX><GRADE_CODE>-OA<NUM>` donde:
- PREFIX: 2 letras de asignatura (ver tabla anterior)
- GRADE_CODE: 01-08 básico, 09=1°medio, 10=2°medio, 11=3°medio, 12=4°medio
- NUM: número del OA con padding a 2 dígitos

Ejemplos: `MA07-OA15`, `LE01-OA03`, `CN10-OA01`, `EC11-OA04`.

## Inconsistencias y limitaciones conocidas

### 1. Cobertura de indicadores: 58.6%

De los 391 OA extraídos, **229 (58.6%) tienen al menos un indicador asignado**. El resto figura con `indicadores: []`. La causa es la conversión PDF→Markdown:

- Los PDFs originales presentan los OA en tablas de 2 columnas (OA | Indicadores).
- `markitdown` colapsa las columnas linealmente y a veces apila todos los indicadores al final de la "página visual" de la tabla.
- El parser asigna esos indicadores al ÚLTIMO OA visible en ese bloque, dejando los anteriores vacíos.

**Impacto**: el conteo y descripción de OA es confiable (cobertura estimada >90%); la asignación granular de indicadores por OA específico requiere revisión manual o re-extracción del PDF con un parser de tablas (ej. `pdfplumber` o `Camelot`) para los casos críticos.

### 2. Asignaturas Matemática y Ciencias Naturales

Estas dos asignaturas usan viñetas `•` tanto en sub-puntos del OA como en indicadores (a diferencia de Lenguaje/Historia donde indicadores usan `-`). El parser aplica una heurística basada en verbos:
- Gerundios (`usando`, `aplicando`, `estimando`) → sub-punto de OA
- Tercera persona plural (`Identifican`, `Resuelven`, `Comparan`) → indicador

Esto funciona bien pero no es perfecto cuando los indicadores se separan visualmente del OA por la mecánica de tabla.

### 3. Descripciones de OA con texto fragmentado

Algunos OA tienen descripciones con palabras desordenadas (ej. `1_basico` Lenguaje OA3: "Identificar (conciencia combinando sus fonemas y sílabas. fonológica)..."). Esto se debe a que el PDF tenía saltos de columna en mitad de la oración. La descripción es legible y útil, pero estilísticamente imperfecta.

### 4. Variantes de naming entre niveles

- `Lenguaje y Comunicación` (básica) vs `Lengua y Literatura` (7° básico+): canonicalizados en keys separadas pero comparten prefijo LE.
- `Ciencias Naturales` desaparece en 3°-4° medio y es reemplazada por `Ciencias para la Ciudadanía`.
- `Historia` se llama oficialmente `Historia, Geografía y Ciencias Sociales`; el parser canonicaliza ambos.
- `Educación Ciudadana` aparece solo en 3° y 4° medio.

## Recomendación para arrancar MVP

**Empezar con `5_basico` o `6_basico`**:

Razones:
1. Tienen **41 OA cada uno** (los más completos junto con 1° medio).
2. Cubren las 4 asignaturas core (Lenguaje, Matemática, Ciencias Naturales, Historia) más Inglés.
3. La estructura del PDF es más limpia que en básica baja (1°-4°) y media (3°-4°).
4. Son grados con alta demanda de validación de estudios (mitad de trayectoria escolar).

**Segunda opción: `1_medio`** (39 OA, 4 asignaturas, edad de mayor demanda de exámenes libres).

**Evitar al arrancar**: `3_medio` y `4_medio` — la introducción de Filosofía/Educación Ciudadana y la división Plan Común/Diferenciado deja solo 19 OA cada uno, insuficientes para una primera prueba representativa.

## Próximos pasos sugeridos

1. **Re-extracción dirigida con `pdfplumber`** para Matemática y Ciencias Naturales (3°-8° básico) — recuperar indicadores que se perdieron por el colapso de tablas.
2. **Etiquetar `eje`** por OA: actualmente queda en `null`; la información está en la descripción de cada asignatura pero requiere mapping manual (ej. para Matemática 1° básico, OA3 pertenece al eje "Números y Operaciones").
3. **Verificar OA codes contra el Currículum Nacional oficial** (curriculumnacional.cl) para validar numeración.
4. **Generar índice inverso** `oa_code → grade + subject` para búsquedas rápidas en el MVP.
