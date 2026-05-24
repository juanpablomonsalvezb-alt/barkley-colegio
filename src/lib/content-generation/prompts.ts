import type { GenerationParams } from './types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function gradeLevelLabel(code: string): string {
  const map: Record<string, string> = {
    '5_basico': '5.° Básico',
    '6_basico': '6.° Básico',
    '7_basico': '7.° Básico',
    '8_basico': '8.° Básico',
    '1_medio': '1.° Medio',
    '2_medio': '2.° Medio',
    '3_medio': '3.° Medio',
    '4_medio': '4.° Medio',
  }
  return map[code] ?? code
}

function difficultyLabel(d: number): string {
  return ['muy fácil', 'fácil', 'intermedio', 'difícil', 'muy difícil'][d - 1] ?? 'intermedio'
}

function baseContext(p: GenerationParams): string {
  return `
Contexto curricular:
- Asignatura: ${p.subject}
- Nivel: ${gradeLevelLabel(p.gradeLevel)}
- Tema: ${p.topic}
- Objetivos de aprendizaje: ${p.learningObjectives.map((o, i) => `\n  ${i + 1}. ${o}`).join('')}
- Dificultad: ${difficultyLabel(p.difficulty)} (${p.difficulty}/5)
- Estilo: ${p.style}
${p.curriculumCode ? `- Código curricular MINEDUC: ${p.curriculumCode}` : ''}

Reglas obligatorias:
- Todo el contenido debe estar en español chileno.
- Usar contexto, ejemplos y referencias de Chile (ciudades, moneda CLP, cultura local).
- Alineado al currículum nacional chileno del MINEDUC.
- Lenguaje apropiado para la edad del nivel indicado.
- NO usar anglicismos innecesarios.
`.trim()
}

// ─── Prompts ────────────────────────────────────────────────────────────────

export function getLessonPrompt(params: GenerationParams): string {
  return `Eres un experto creador de contenido educativo para el sistema escolar chileno.
Genera una lección completa con los siguientes elementos:

${baseContext(params)}

Genera un JSON con exactamente esta estructura (sin texto fuera del JSON):

{
  "videoScript": "Guión de video de 5 a 8 minutos (800-1200 palabras). Incluye instrucciones de escena entre [corchetes]. Tono cercano, motivador, como un profesor joven que conecta con los estudiantes.",
  "contentHtml": "Contenido HTML de la lección (sin tags <html>, <head>, <body>). Usa <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>, <blockquote>, <table>. Incluye explicaciones claras, ejemplos prácticos con contexto chileno, y recuadros destacados para conceptos clave.",
  "summary": "Resumen de 3-5 oraciones de lo aprendido en la lección.",
  "estimatedMinutes": 15
}

Ejemplo de videoScript:
"[Intro con animación del logo Barkley]\\n\\nHola, ¿cómo están? Hoy vamos a aprender sobre las fracciones...\\n\\n[Mostrar gráfico de una pizza dividida en 8 partes]\\n\\nImaginen que están en una pizzería en el barrio Bellavista..."

Responde SOLO con el JSON válido. Sin markdown, sin comentarios.`
}

export function getQuizPrompt(params: GenerationParams): string {
  return `Eres un experto en evaluación educativa para el sistema escolar chileno.
Genera un quiz completo con mínimo 20 preguntas variadas.

${baseContext(params)}

Distribución de tipos de preguntas:
- opcion_multiple: ~70% (14 preguntas mínimo)
- verdadero_falso: ~15% (3 preguntas mínimo)
- completar: ~15% (3 preguntas mínimo)

Cada pregunta debe tener dificultad variada (1 a 5), con mayoría centrada en nivel ${params.difficulty}.

Genera un JSON con exactamente esta estructura:

{
  "questions": [
    {
      "question_text": "¿Cuál es el resultado de 3/4 + 1/4?",
      "question_type": "opcion_multiple",
      "options": { "a": "1/2", "b": "1", "c": "4/8", "d": "3/4" },
      "correct_answer": "b",
      "feedback_correct": "¡Excelente! Al sumar fracciones con el mismo denominador, sumamos los numeradores: 3+1=4, y 4/4 = 1.",
      "feedback_incorrect": "Recuerda: cuando los denominadores son iguales, solo sumas los numeradores.",
      "feedback_per_option": {
        "a": "Incorrecto. 1/2 no es el resultado correcto.",
        "b": "¡Correcto! 3/4 + 1/4 = 4/4 = 1",
        "c": "Incorrecto. 4/8 = 1/2, no es lo que buscamos.",
        "d": "Incorrecto. 3/4 es solo uno de los sumandos."
      },
      "feedback_hint": "Piensa: si tienes 3 cuartos de pizza y te dan 1 cuarto más, ¿cuánto tienes?",
      "difficulty_level": 2,
      "topic_tag": "fracciones",
      "points": 10
    },
    {
      "question_text": "Verdadero o falso: 1/2 es mayor que 2/3.",
      "question_type": "verdadero_falso",
      "options": { "a": "Verdadero", "b": "Falso" },
      "correct_answer": "b",
      "feedback_correct": "¡Bien! 1/2 = 0,5 y 2/3 ≈ 0,667, así que 2/3 es mayor.",
      "feedback_incorrect": "Compara convirtiéndolas a decimales: 1/2 = 0,5 y 2/3 ≈ 0,667.",
      "feedback_per_option": null,
      "feedback_hint": "Convierte ambas fracciones a decimales para comparar.",
      "difficulty_level": 1,
      "topic_tag": "fracciones",
      "points": 5
    },
    {
      "question_text": "Completa: La fracción 6/8 simplificada es ___",
      "question_type": "completar",
      "options": {},
      "correct_answer": "3/4",
      "feedback_correct": "¡Correcto! Dividimos numerador y denominador por 2: 6÷2=3, 8÷2=4.",
      "feedback_incorrect": "Busca el máximo común divisor de 6 y 8 para simplificar.",
      "feedback_per_option": null,
      "feedback_hint": "¿Qué número divide tanto a 6 como a 8?",
      "difficulty_level": 3,
      "topic_tag": "fracciones",
      "points": 10
    }
  ]
}

Genera EXACTAMENTE 20 preguntas o más. Responde SOLO con el JSON válido.`
}

export function getReinforcementPrompt(params: GenerationParams): string {
  return `Eres un experto en educación inclusiva y refuerzo académico para el sistema escolar chileno.
Genera material de refuerzo simplificado para estudiantes que necesitan apoyo adicional.

${baseContext(params)}

El contenido de refuerzo debe:
- Explicar los conceptos de forma MÁS SIMPLE que la lección original
- Usar más ejemplos visuales y concretos
- Avanzar paso a paso, sin saltar etapas
- Incluir analogías cotidianas chilenas
- Preguntas de dificultad 1-2 únicamente

Genera un JSON con esta estructura:

{
  "contentHtml": "HTML simplificado del contenido de refuerzo. Usa lenguaje muy claro, muchos ejemplos paso a paso, recuadros de 'Recuerda' y 'Tip'. Mínimo 500 palabras.",
  "questions": [
    {
      "question_text": "Pregunta sencilla de refuerzo",
      "question_type": "opcion_multiple",
      "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
      "correct_answer": "a",
      "feedback_correct": "Feedback positivo y motivador",
      "feedback_incorrect": "Explicación paso a paso de por qué no es correcto",
      "feedback_per_option": { "a": "...", "b": "...", "c": "...", "d": "..." },
      "feedback_hint": "Pista útil",
      "difficulty_level": 1,
      "topic_tag": "tema",
      "points": 5
    }
  ]
}

Genera mínimo 10 preguntas de dificultad 1-2. Responde SOLO con el JSON válido.`
}

export function getChallengePrompt(params: GenerationParams): string {
  return `Eres un experto en educación de alto rendimiento para el sistema escolar chileno.
Genera contenido de desafío avanzado para estudiantes destacados.

${baseContext(params)}

El contenido de desafío debe:
- Profundizar más allá del currículum base
- Incluir problemas de pensamiento crítico y aplicación
- Plantear conexiones interdisciplinarias
- Proponer un proyecto práctico realizable

Genera un JSON con esta estructura:

{
  "contentHtml": "HTML con contenido avanzado. Incluye secciones: Profundización, Conexiones, Pensamiento Crítico. Usa ejemplos complejos con contexto chileno. Mínimo 600 palabras.",
  "projectDescription": "Descripción detallada de un proyecto práctico que el estudiante puede realizar. Incluye: Objetivo, Materiales necesarios, Pasos (mínimo 5), Criterios de evaluación, Tiempo estimado. El proyecto debe ser realizable en Chile con recursos accesibles."
}

Responde SOLO con el JSON válido.`
}

export function getAdaptiveRulesPrompt(params: GenerationParams): string {
  return `Eres un experto en educación adaptativa para el sistema escolar chileno.
Genera las 3 reglas adaptativas (refuerzo, normal, desafío) para una lección.

${baseContext(params)}

Cada regla debe tener un mensaje motivacional apropiado para el nivel del estudiante.

Genera un JSON con esta estructura:

{
  "refuerzo": {
    "messageTitle": "¡Vamos paso a paso!",
    "messageBody": "Mensaje motivador para el estudiante que necesita refuerzo. Debe ser empático, sin hacer sentir mal al estudiante. Máximo 2 oraciones.",
    "xpMultiplier": 1.5
  },
  "normal": {
    "messageTitle": "¡Buen trabajo!",
    "messageBody": "Mensaje de reconocimiento por el desempeño estándar. Motivar a seguir aprendiendo. Máximo 2 oraciones.",
    "xpMultiplier": 1.0
  },
  "desafio": {
    "messageTitle": "¡Eres crack!",
    "messageBody": "Mensaje de felicitación por el alto rendimiento. Invitar al desafío avanzado. Máximo 2 oraciones.",
    "xpMultiplier": 2.0
  }
}

Responde SOLO con el JSON válido.`
}
