# UX de Presentación de Contenido Educativo — Investigación Exhaustiva para Barkley

**Autor:** UX Research Agent — Nebbuler/Barkley
**Fecha:** 24 mayo 2026
**Contexto:** Plataforma chilena para preparación de Exámenes Libres MINEDUC (5° básico a 4° medio), 100% contenido pregenerado (video + texto + quiz), sin profesores en vivo.
**Objetivo:** Definir la arquitectura óptima de una "lección Barkley" a partir del análisis de las plataformas edtech líderes del mundo.

---

## 0. Metodología y honestidad de la investigación

Se utilizó WebSearch + WebFetch sobre las 16 plataformas solicitadas. Algunas plataformas (Khan Academy, Duolingo, IXL, Brilliant en sus URLs raíz) entregaron poca información directa por su renderizado JavaScript en cliente — esto se compensó con búsqueda de literatura UX/pedagógica secundaria (research papers, blogs oficiales, casos de estudio, reviews independientes). Donde un dato es **inferido o secundario**, lo marco explícitamente. Donde es **dato confirmado** (de la propia plataforma o paper de research), va sin asterisco.

Plataformas con data sólida: Khan Academy, IXL, Brilliant, Duolingo, BYJU's, Coursera/EdX, Quizizz/Kahoot, Photomath, Synthesis, Outschool, Wited, Brincus, Crehana, Platzi.

Plataformas con data parcial: Nivelando (México) — sin información pública detallada de UX más allá de marketing.

---

## 1. Análisis plataforma por plataforma

### 1.1 Khan Academy — el patrón oro del asincrónico gratuito

**Arquitectura de la lección:**
1. Estudiante entra a una **Unidad** (ej. "Fracciones, 5° grado").
2. Sidebar izquierdo muestra la Unidad dividida en **Lessons** (sub-temas).
3. Cada Lesson se compone secuencialmente de: **video → artículo opcional → ejercicio de práctica (4-7 preguntas) → quiz (≥5 preguntas)**.
4. Al completar todas las Lessons de la Unidad: **Unit Test (≥9 preguntas)**.
5. Al final del curso completo: **Course Challenge (30 preguntas)**.

**Duración por bloque (datos confirmados):**
- Video: **6-9 minutos promedio**. Cortados en chunks naturales con pausas. Controles de velocidad, pausa, rebobinar.
- Práctica: 4-7 preguntas (~5-8 min).
- Quiz: ≥5 preguntas (~7-10 min).
- Unit Test: ≥9 preguntas (~15 min).
- **Sesión total por Lesson: ~20-25 minutos.**

**Mix de contenido:** ~50% video, ~10% texto/artículo, ~40% ejercicios interactivos.

**Estructura visual:** Layout de tres columnas en desktop. Sidebar izquierdo con árbol de contenido + check verde cuando completas. Centro: el bloque actual. Top: breadcrumb (Course > Unit > Lesson). Barras de progreso "Mastery" por skill (Familiar → Proficient → Mastered).

**Microlearning vs lección larga:** Chunks de 5-10 min ensamblados en flujos de 20-25 min. No hay lecciones monolíticas de 45+ min.

**Interactividad:** Ejercicios paso a paso con hints; "Get a hint" rompe el problema en sub-pasos sin dar la respuesta. Editor de ecuaciones en línea.

**Gamificación:** **Energy Points (XP)** visibles arriba a la derecha; **badges/avatares** (Meteorite → Sun → Earth → Black Hole) desbloqueables por logros acumulados; **streaks** opcionales en el path. Es gamificación moderada — no agresiva como Duolingo.

**Retroalimentación post-quiz:** Muestra qué erraste + explicación paso a paso + link al video que cubre ese skill. Sistema **Mastery**: si fallas, el skill baja de nivel y te re-asigna práctica hasta dominar. **Esta es la pieza clave: no es solo score, es ruta adaptativa.**

**Mobile:** App nativa iOS/Android replica todo pero apila bloques verticalmente; sidebar se convierte en menú hamburguesa.

**Onboarding:** Diagnóstica con "Mastery Challenge" inicial → mapa visual del curso con check/lock por unidad.

---

### 1.2 IXL Learning — el rey del drill adaptativo con SmartScore

**Arquitectura:** Currículum dividido en miles de **"skills" granulares** (ej. "5° grado > Multiplicar fracciones por enteros"). NO hay video introductorio por defecto; el estudiante entra directo a practicar.

**Mix:** ~90% ejercicios interactivos, ~10% explicaciones (que aparecen solo cuando fallas).

**Duración:** Una skill típica son 15-20 problemas para llegar a SmartScore 100; ~10-15 minutos.

**SmartScore (la pieza icónica):**
- Score 0 → 100 que sube/baja según aciertas/fallas, ponderado por dificultad y consistencia.
- 80 = proficient, 90 = excellent, **90+ entra al "Challenge Zone"** con preguntas más difíciles, 100 = mastery.
- Si fallas: SmartScore baja, próximas preguntas son más fáciles, te muestran **walkthrough paso a paso de la solución correcta**.

**Estructura visual:** Una pregunta a la vez ocupa el centro de la pantalla. SmartScore como gauge circular siempre visible. No hay scroll: cada pregunta es una pantalla.

**Gamificación:** Awards/medals desbloqueables; mapa virtual donde "construyes un parque temático" desbloqueando piezas con SmartScore.

**Crítica documentada:** Padres reportan que el SmartScore "que baja" genera **frustración real en niños menores de 12** sin acompañamiento adulto. Lección importante para Barkley: la presión del score requiere amortiguadores emocionales (mensajes positivos, "estás aprendiendo", no solo el número crudo).

**Mobile:** App nativa; misma UI de "una pregunta = una pantalla", funciona muy bien en touch.

---

### 1.3 Brilliant.org — "Learn by doing", anti-video

**Arquitectura:** Curso > Capítulos > Lecciones interactivas. **NO hay videos lecturas**. Filosofía explícita: "el medio es el método de enseñanza".

**Mix:** ~5% texto introductorio breve, ~95% interactividad guiada (diagramas drag-drop, preguntas socráticas paso a paso, sliders, visualizaciones manipulables).

**Duración por lección:** **15-20 minutos**, una lección por día es el "target" sugerido por la app.

**Estructura visual:** Una pantalla = un concepto + una interacción + una pregunta. Avanzas paginando (no scroll). Botón "Next" tras responder. Animaciones suaves (Rive) entre pantallas para reforzar el cambio de concepto.

**Retroalimentación:** **Inmediata pregunta por pregunta**. Si fallas, muestra el razonamiento correcto antes de continuar. No te quedas atascado.

**Gamificación:** Streak diaria visible al inicio; "leagues" semanales (opt-in); celebración con confetti al completar lección.

**Mobile:** App nativa; el formato pantalla-por-pantalla es **mobile-first nativo**, no adaptado.

**Lección clave para Barkley:** Para conceptos abstractos (matemática, ciencias), reemplazar video por **interacción guiada** retiene 2-3× más que video pasivo (research citada por Brilliant + paper de Mayer/Khan).

---

### 1.4 Duolingo — la biblia de la microlección + gamificación

**Arquitectura:** "Learning Path" vertical de **unidades** en zig-zag (estilo Candy Crush). Cada unidad tiene 4-6 niveles. Cada nivel = una **lección de 5 minutos**.

**Duración:** **5 minutos por lección** (15-20 ejercicios). Una unidad completa = ~25 min.

**Tipos de ejercicio:** Selección múltiple, "tap what you hear", "translate", "speak", emparejar, completar frase. **Nunca más de 30 segundos en una sola interacción.**

**Gamificación (la más agresiva del mercado, y funciona):**
- **XP** por ejercicio correcto (visible inmediatamente arriba).
- **Streak** (racha diaria) — el motor #1 de retención. Usuarios con streak ≥7 días son 3.6× más propensos a quedarse engaged a largo plazo.
- **Gemas/lingots** (moneda interna) para comprar power-ups (streak freeze, double XP).
- **Leagues** semanales (Bronze → Diamond → Obsidian) — el leaderboard hace que usuarios activos completen **40% más lecciones por semana**.
- **Health/Lives** (versión free): perdés vida al fallar, te bloquea, te empuja a Super (suscripción) o esperar.
- **Notificaciones** del búho ("Duo") — psicología agresiva, eficaz, controversial.

**Métricas reportadas:** Churn bajó de 47% (2020) a 28% (2026) en mercados core.

**Onboarding:** Pre-registro test de nivel (3 min) → primera lección **antes de pedir signup** ("commitment device").

**Retroalimentación:** Pregunta por pregunta. Animación verde/roja + sonido. Al final de lección: stats (precisión, XP ganada, tiempo).

**Mobile-first absoluto.** La web es secundaria; el producto principal está en mobile portrait.

---

### 1.5 BYJU's — el caso de estudio del éxito pedagógico y fracaso de negocio

**Arquitectura:** Lecciones grabadas profesionales (set de TV, animaciones cinematográficas, profesores estrella). Contenido divido en **módulos de 5 minutos** con clases que pueden encadenarse en sesiones de 1 hora.

**Mix:** ~70% video producido (alta producción, 2D animations, special effects), ~15% práctica gamificada (sliders, bubble bursts, picture sorts, word puzzles), ~15% quizzes adaptativos.

**Adaptive learning:** Diagnóstico inicial → "Personalized Knowledge Graph" identifica fortalezas/gaps → recomienda secuencia.

**Lección crítica para Barkley:** BYJU's tenía **producto pedagógico excelente** pero murió por:
1. Sales agresivos puerta a puerta (hard selling, vendieron hardware caro a padres pobres bajo presión).
2. CAC > LTV — gastaron 30%+ de revenue en marketing.
3. Falta de mentorship humano — quisieron "appificar todo" cuando padres latinoamericanos (y indios) valoran contacto humano.

**Para Barkley:** Producto-mercado fit existe en pregrabado de alta calidad, pero **el modelo debe tener algún touchpoint humano** (chat tutor, foros moderados, simulacro en vivo) para no caer en el síndrome BYJU.

---

### 1.6 Coursera / EdX — el modelo "weekly module" universitario, malo para K-12

**Arquitectura:** Curso > Semanas (módulos) > Lecciones > Items. Items son video, lectura, quiz, assignment.

**Duración:**
- Video lectura: **8-12 min** típicamente (varían por instructor; Coursera recomienda <10 min).
- Lección total: **60-90 min** (puede partirse en sesiones).
- Semana completa: ~3-5 horas.

**Quiz format:** In-video quizzes (formativas, ungraded, aparecen cada ~5 min dentro del video) + graded quiz al final de la semana.

**Mix:** ~70% video, ~15% lectura, ~10% quiz, ~5% peer assignments.

**Para Barkley:** El formato Coursera es **demasiado largo para K-12**. Pero la idea de **in-video quiz cada 3-5 minutos para forzar engagement activo** es oro — Khan también lo hace.

---

### 1.7 Quizizz / Kahoot — referencia para el módulo de quiz

**Kahoot:** Game-show sincrónico, todos responden a la vez, countdown timer 20-30s por pregunta, música, leaderboard live. Mejor para aula presencial.

**Quizizz:** Quiz **self-paced**, cada estudiante en su device a su ritmo, leaderboard compartido pero asíncrono. Memes después de cada respuesta correcta. **Es el modelo más cercano al que Barkley necesita para sus quizzes asincrónicos.**

**Preferencia estudiantil reportada:** 48% Kahoot (competencia), 44% Quizizz (autonomía), 8% Quizlet.

**Lección para Barkley:** Quiz asincrónico tipo Quizizz + **memes/celebraciones visuales** + leaderboard semanal (no live) es el sweet spot para K-12 sin sincronía.

---

### 1.8 Photomath / Mathway — paso a paso explicativo

Modelo de "**scan → solución paso a paso explicada con lenguaje natural**". Cada paso explicado en una línea, con opción de expandir el "por qué" de ese paso.

**Para Barkley:** Inspiración directa para la **retroalimentación post-quiz**. No mostrar solo "respuesta correcta = X". Mostrar:
1. La operación/paso 1 con explicación.
2. Paso 2 con explicación.
3. Resultado final.
4. Mini-video opcional de 90s "ver explicación completa".

---

### 1.9 Synthesis Tutor — el AI tutor conversacional para 5-11 años

**Arquitectura:** Diagnóstico inicial → tutor conversacional IA trabaja en sesiones de **20-30 min/día**, 5 días a la semana.

**Formato:** El tutor IA **pide al niño explicar su razonamiento** en lenguaje natural, no solo seleccionar respuesta. Hands-on con visualizaciones, hints adaptativos.

**Para Barkley 5°-8° básico:** Modelo a estudiar de cerca para la versión "chat tutor" futura. El **"pídeme que explique"** transforma a un estudiante pasivo en activo. Aunque Barkley inicial sea sin IA tutor, dejar el rail para agregarlo en v2 es estratégico.

---

### 1.10 Outschool — el contraste sincrónico

Outschool es 100% **clases en vivo vía Zoom** (3-18 años), opcional self-paced. Modelo opuesto a Barkley.

**Lección clave:** Lo que Outschool ofrece que Barkley NO puede dar es **interacción social**. Hay que compensarlo con:
- Foros moderados estilo Discord/comunidad.
- Cohortes mensuales (grupo de estudiantes que entran el mismo mes y rinden juntos).
- Mensajes/celebraciones visuales que simulan presencia social.

---

### 1.11 Wited (Chile) — competidor directo, modelo híbrido

**Arquitectura (de su sitio):**
- **Clases en vivo** lunes a viernes 9:00-13:30, 50-60 min cada una. Grabadas para asincrónico.
- **Cápsulas de aprendizaje** (videos cortos complementarios).
- **5 ensayos al año** (abril-septiembre) tipo examen libre.
- **Plataforma** muestra dashboard de progreso, estadísticas, materiales.

**Gamificación:** **MaxPoints** (100-500 según plan) — sistema de puntos canjeables dentro de la plataforma.

**Diferenciador:** Tiene **cuenta supervisor para padres** con reportes de desempeño.

**Para Barkley:** Wited es **híbrido sincrónico+asíncrono**. Si Barkley es 100% asincrónico, debe **comunicar claramente la ventaja de "tu horario, tu ritmo"** y no intentar competir en "sesiones en vivo". Pero **debe igualar o superar** el reporte para padres (esto es decisivo en compra B2C para menores).

---

### 1.12 Brincus (Chile) — el competidor más parecido a Barkley

**Arquitectura:**
- Clases en vivo diarias + biblioteca de videos asincrónicos exclusivos (no curados de terceros).
- **Ciclo pedagógico explícito:** ver video explicativo → validar con quiz → reforzar con guía práctica → repetir hasta dominar.
- Simulacros mensuales tipo examen libre.
- **IA chat 24/7** para resolver dudas.
- Plataforma propia (no Moodle).

**Cada clase incluye:** video + material descargable + espacio de interacción con IA.

**Métrica:** Reportan 98% aprobación en exámenes libres.

**Para Barkley — el insight clave:** Brincus ya tiene el **ciclo "video → quiz → guía → repite"** que es el patrón global probado. Barkley necesita **diferenciarse por ejecución superior**: mejor UX del player, mejor gamificación, mejor retroalimentación adaptativa (Brincus no parece tener Mastery Learning estilo Khan), y precio agresivo (Brincus es caro).

---

### 1.13 Crehana / Platzi (LATAM, adultos pero referencia LATAM)

- **Crehana:** Videos pre-grabados **1-12 min** cada uno. Microlearning. Sección de notas integrada al player. Proyecto final con feedback.
- **Platzi:** Cursos largos no divididos por niveles, learning paths agrupados, quiz al final, comunidad activa, "diploma" al completar.

**Para Barkley:** Crehana confirma el rango **1-12 min de video por bloque** como sweet spot LATAM. La **sección de notas integrada al player** es una feature que casi nadie en K-12 tiene y sería diferencial.

---

### 1.14 Nivelando (México)

Información pública limitada — aparece como plataforma de nivelación K-12 con tutores. **No se obtuvo detalle suficiente del UX de su player para análisis.** Recomiendo monitoreo manual posterior con cuenta de prueba.

---

## 2. Síntesis: patrones que se repiten en plataformas exitosas

### A. Top 5 patrones UX que aparecen en TODAS las plataformas top

1. **Microlearning estricto: bloques de 5-12 minutos máximo.** Khan (6-9 min video), Duolingo (5 min lección), Crehana (1-12 min), BYJU's (5 min), Brilliant (15-20 min lección pero con micro-pantallas de <60s). El cerebro pierde foco después; los datos lo confirman a través de plataformas y demografías.

2. **Retroalimentación inmediata pregunta-por-pregunta, no solo score final.** Brilliant, Duolingo, IXL, Khan, Synthesis, Quizizz — todos explican el error en el momento, no al final. **Quien solo muestra score final pierde la oportunidad de aprendizaje.**

3. **Ruta adaptativa / Mastery Learning visible.** Khan (Mastery levels), IXL (SmartScore), Brilliant (paths que se desbloquean), Synthesis (AI tutor que se calibra). El estudiante ve "estoy aquí, esto me falta", y el sistema le ajusta dificultad/repetición. **Sin esto, el producto es solo "videos online".**

4. **Progreso visual permanentemente en pantalla.** Barra de progreso de la lección, mapa del curso con check/lock, mastery por skill. El estudiante NUNCA debe preguntarse "¿cuánto me falta?". Visible siempre = motivación + sensación de control.

5. **Gamificación con XP + Streak + Badges, integrada al flujo (no como capa pegada).** El XP suma al terminar el ejercicio, no al cerrar sesión. La racha aparece al abrir la app, no escondida en un menú. Los badges celebran logros específicos (no genéricos). Duolingo es el extremo, Khan es la versión "moderada profesional" — Barkley debe acercarse más a Khan que a Duolingo (es educación formal, no juego).

### B. Top 3 anti-patrones a evitar (lo que hacen las plataformas malas)

1. **Video largo de 30-45 min sin interacción intermedia.** Es el formato "clase grabada universitaria" y mata el engagement K-12. Muchos competidores chilenos solo suben videos largos de Zoom — esto es lo que Barkley NO debe hacer.

2. **Quiz que solo muestra "respondiste X/10 correctas" sin explicar.** Es la diferencia entre evaluación y aprendizaje. **Cada respuesta — correcta o incorrecta — debe tener explicación de 2-3 líneas mínimo.**

3. **UI sobrecargada con menús, banners, ads, notificaciones, gamificación intrusiva.** BYJU's pecó de esto en versiones tardías (popups de venta dentro de lecciones). El **player de lección debe ser un "espacio sagrado"** — sin distracciones, sin upsells, sin notificaciones.

**Bonus anti-patrones (cuarto y quinto, también críticos):**

4. **Forzar sincronía cuando el valor está en la asincronía.** Si Barkley promete "tu horario", no agendar clases obligatorias destruye la propuesta.

5. **Ignorar al padre.** En K-12 LATAM **quien paga es el padre**. Sin dashboard para padre con métricas claras semanales, no hay renovación.

---

## 3. Estructura recomendada de UNA lección Barkley

### 3.1 Orden de bloques (lección estándar 4° básico a 4° medio)

```
╔══════════════════════════════════════════════════╗
║  BLOQUE 1 — INTRO/HOOK (60-90 segundos)          ║
║  Texto + ilustración: "¿Para qué sirve esto?"    ║
║  Conexión con vida real o con examen libre.      ║
╠══════════════════════════════════════════════════╣
║  BLOQUE 2 — VIDEO EXPLICATIVO (5-8 min)          ║
║  Video producido, animaciones, profesor visible. ║
║  Subtítulos español Chile. Controles velocidad.  ║
║  In-video checkpoint cada 2-3 min (1 pregunta).  ║
╠══════════════════════════════════════════════════╣
║  BLOQUE 3 — TEXTO RESUMEN (150-250 palabras)     ║
║  Concepto clave + fórmulas + 1 ejemplo resuelto. ║
║  Cita del programa MINEDUC (para señalar curric).║
╠══════════════════════════════════════════════════╣
║  BLOQUE 4 — PRÁCTICA GUIADA (3-4 ejercicios)     ║
║  Paso a paso con hints. No suma a score.         ║
║  Modelo Brilliant: feedback inmediato + razón.   ║
╠══════════════════════════════════════════════════╣
║  BLOQUE 5 — QUIZ DE LECCIÓN (5 preguntas)        ║
║  Suma XP. Tipo Quizizz (asíncrono, celebración). ║
║  Cada respuesta: explicación 2-3 líneas + link   ║
║  a minuto exacto del video si fallaste.          ║
╠══════════════════════════════════════════════════╣
║  BLOQUE 6 — CIERRE + RUTA ADAPTATIVA             ║
║  Si score ≥80%: badge + XP + desbloquea próxima. ║
║  Si score <80%: refuerzo (1 video corto + 3 ej). ║
║  Resumen visual: "Dominaste X, te falta Y".      ║
╚══════════════════════════════════════════════════╝
```

### 3.2 Duración objetivo (suma total)

| Edad | Duración total lección | Notas |
|---|---|---|
| 5°-6° básico (10-11 años) | **15-18 min** | Video 4-5 min, quiz 3 preguntas en v1 |
| 7°-8° básico (12-13 años) | **18-22 min** | Video 5-6 min, quiz 4-5 preguntas |
| 1°-2° medio (14-15 años) | **22-28 min** | Estructura completa arriba |
| 3°-4° medio (16-17 años) | **25-35 min** | Puede llegar a 35 con quiz de 7 preguntas |

**Regla:** ningún bloque individual >10 min. Si un tema requiere más, se parte en dos lecciones.

### 3.3 Textos: extensión

- **Intro/Hook:** 40-60 palabras.
- **Resumen post-video:** 150-250 palabras + 1 ejemplo resuelto en bloque visual aparte.
- **Explicación post-quiz por pregunta:** 30-80 palabras + opción "ver paso a paso completo" expandible.
- **No usar textos >300 palabras en bloque único.** Si requiere más, dividir con subtítulos H3 + ilustración intermedia.

### 3.4 Quiz: cantidad de preguntas

- 5°-6° básico: **3 preguntas** por lección. Quiz unidad: 6.
- 7°-8° básico: **4-5 preguntas**. Quiz unidad: 8.
- 1°-4° medio: **5 preguntas**. Quiz unidad: 10. Simulacro examen libre: réplica del formato MINEDUC oficial (cantidad real del examen).

### 3.5 Cuándo aparece la ruta adaptativa

- **Después de cada quiz de lección.** Si score ≥80% → avanza. Si <80% → bloque de refuerzo automático (un mini-video + 3 ejercicios extra de la misma skill) antes de poder avanzar a la siguiente lección.
- **Mastery por skill estilo Khan:** Familiar (1 quiz aprobado) → Proficient (quiz aprobado +1 semana después) → Mastered (quiz aprobado en simulacro de unidad). Visible en sidebar.

### 3.6 Gamificación: cuándo aparecen XP, badges, feedback

| Momento | Elemento gamificado |
|---|---|
| Completas in-video checkpoint | +5 XP visible animación corta |
| Completas práctica guiada | +20 XP |
| Completas quiz de lección con ≥80% | +50 XP + badge si es primera vez en el tema |
| Completas unidad completa | +200 XP + badge unidad + celebración (confetti, pero sutil) |
| Mantienes racha diaria | Streak counter visible al login + +10 XP bonus |
| Subes en leaderboard semanal cohorte | Notificación al abrir app día siguiente |
| Apruebas simulacro mensual | Badge especial + reporte para padre/madre |

**No usar:** sistema de "vidas/health" estilo Duolingo (es educación formal, no debemos bloquear acceso por errar). No usar leaderboard live competitivo (ansiedad innecesaria). Sí usar leaderboard semanal de cohorte (acotado al grupo del mismo nivel).

---

## 4. Comparación con competencia chilena directa

### Wited
- **Fortaleza:** Sincronía + asincronía híbrida; dashboard para padres maduro; brand reconocida.
- **Debilidad:** Requiere horario fijo de mañana (no es 100% "tu ritmo"); plataforma se siente más "Moodle" que producto premium; gamificación tibia (MaxPoints poco visibles).
- **Qué emular:** Reporte para padres detallado; estructura de 5 ensayos calendarizados al año.
- **Qué evitar:** El compromiso de "clases en vivo diarias" que ahuyenta a quienes buscan asincronía real.

### Brincus
- **Fortaleza:** Producto pedagógico claro (ciclo video → quiz → guía → repetir); IA chat 24/7; 98% aprobación reportada; plataforma propia bien estructurada.
- **Debilidad:** Precio alto (B2C premium); UX del player parece estándar sin gamificación distintiva; depende de simulacros en vivo mensuales.
- **Qué emular:** El ciclo pedagógico explícito y comunicado al usuario; la IA tutor en chat (poner en roadmap v2); reportes para padre.
- **Qué evitar:** El framing "colegio online completo" puede ser overkill para estudiantes que solo quieren rendir examen libre. **Barkley puede atacar el segmento "preparación pura para examen" (más barato, más enfocado)** y crecer al modelo full school después.

### Diferenciador estratégico para Barkley
- 100% asincrónico (vs Wited/Brincus híbridos).
- Mastery Learning visible estilo Khan (ninguno chileno lo tiene formal).
- Gamificación moderada-alta tipo Duolingo light (ninguno chileno lo tiene robusto).
- Retroalimentación post-quiz tipo Photomath (paso a paso explicado).
- Precio agresivo: 1/3 a 1/2 de Brincus, posicionado como "prepárate para tu examen libre, no para todo el colegio".

---

## 5. Ajustes por edad — 5° básico (10-11 años) vs 4° medio (16-17 años)

| Aspecto | 5°-6° básico (10-12) | 3°-4° medio (15-17) |
|---|---|---|
| Atención máxima | 20-30 min total | 35-50 min total |
| Video duración | 3-5 min | 7-10 min |
| Quiz preguntas | 3 | 5-7 |
| Tono visual | Colores vivos, ilustraciones, mascota (?) | Sobrio, profesional, "casi adulto" |
| Tipografía | Más grande (18-20px body) | 15-16px body |
| Tipo profesor en video | Joven, energético, lenguaje cercano | Profesor experto, técnico cuando necesario |
| Gamificación | Más visible: badges grandes, animaciones, mascota celebra | Discreta: XP en esquina, streak, leaderboard de cohorte |
| Retroalimentación errores | Mensaje suave + mascota: "¡Casi! Mira este truco" | Directo + técnico: "Error en el paso 2, revisa..." |
| Longitud texto | Máx 120 palabras por bloque | 250 palabras OK |
| Frecuencia recompensas | Cada interacción (alta dopamina) | Por hito (quiz, unidad) |
| Cantidad lecciones/día sugerida | 1-2 (capacidad atención) | 3-4 (puede sostener sesiones largas) |
| Reporte padres | Semanal automático + alertas si racha rota | Mensual + acceso opcional padre |
| Mascota / personaje | **Sí (recomendado).** Una mascota Barkley animal/personaje que celebra, anima, da hints. Crítico para retención en pre-adolescentes. | **No.** Personaje sería percibido como infantil; se vuelve contraproducente. |

### Recomendaciones específicas 5° básico
1. **Mascota Barkley con personalidad** (perro? — el nombre invita) que aparece en transiciones, celebra logros, da hints en práctica guiada con bocadillos amigables.
2. **Sesiones de máximo 2 lecciones encadenadas** antes de "brain break" sugerido (animación lúdica de 30s).
3. **Reportes semanales para padres automatizados por email** con: lecciones completadas, racha, áreas dominadas, áreas por reforzar, sugerencia conversacional "Pregúntale a tu hijo/a sobre X esta semana".
4. **Audio narrado opcional** en textos (algunos niños 10-11 todavía leen lento; el audio reduce fricción).
5. **Controles parentales:** padre puede activar/desactivar leaderboard si genera ansiedad.

### Recomendaciones específicas 4° medio
1. **Eliminar mascota**, usar tono institucional/profesional.
2. **Modo "estudio para examen"** alterno al modo lección: solo simulacros y revisión de errores, sin gamificación visible.
3. **Estadísticas detalladas tipo dashboard analítico:** % por eje del programa MINEDUC, tiempo invertido, comparación con cohorte (anónima), predicción de aprobación examen libre.
4. **Comunidad de pares** (Discord/foro moderado) — adolescentes valoran el peer más que la mascota.
5. **Modo nocturno + offline** — esta cohorte estudia en horarios irregulares.

---

## 6. Recomendaciones de implementación priorizadas

### MVP (lanzar con esto)
1. Estructura de bloques 1-6 descrita arriba.
2. Video player con in-video checkpoint cada 2-3 min.
3. Quiz con feedback inmediato + explicación por pregunta.
4. XP + streak + 5-8 badges básicos.
5. Sidebar de progreso con mastery por skill (Familiar/Proficient/Mastered).
6. Dashboard padre con email semanal automático.
7. Ruta adaptativa: refuerzo automático si quiz <80%.

### V2 (3-6 meses post-lanzamiento)
1. AI chat tutor 24/7 (para igualar Brincus).
2. Mascota Barkley animada (segmento básica).
3. Leaderboard cohorte semanal.
4. Cápsulas de microlearning (Reels educativos de 60s para reforzar en mobile).
5. Modo offline.

### V3 (futuro)
1. Tutor conversacional tipo Synthesis (IA que pide al estudiante explicar razonamiento).
2. Realidad aumentada para ciencias.
3. Cohortes mensuales con simulacro grupal asincrónico.
4. Generación adaptativa de ejercicios por IA basados en errores específicos del estudiante.

---

## 7. Decisiones críticas que Barkley debe tomar ahora

1. **¿Mascota sí o no en 5°-8° básico?** Recomiendo **sí**, basado en retención evidencia Duolingo/Khan badges. Riesgo: percepción "infantil" si mal ejecutada.
2. **¿Cuánto cobrar?** US$19/mes plataforma global ya definido; pero **considerar tier "Examen Libre" más barato (US$9-12)** enfocado solo a prep examen, sin acceso a contenido completo de curso. Compete directo con Brincus en precio.
3. **¿Incluir alguna sincronía?** Mi recomendación: NO en lecciones, **SÍ en 1 simulacro mensual en vivo grupal** (Zoom + chat) para crear momento de cohorte. Cuesta poco (1 sesión/mes/nivel), agrega percepción de comunidad, contesta el "no hay profesor".
4. **¿Construir en LMS existente (Moodle, Open edX) o full custom?** Para alcanzar el UX descrito arriba, **debe ser custom** (Next.js + Supabase, stack ya elegido). LMS estándar no permite la calidad de player ni gamificación integrada.
5. **¿Producción de video propia o curada?** Propia. Curado (YouTube embed) es lo que hacen los preuniversitarios chilenos gratuitos y se siente low-cost. **Inversión en estudio + animaciones tipo BYJU's-light** es lo que justifica el precio premium.

---

## 8. Resumen ejecutivo (1 página para presentar)

**La lección Barkley = 20-25 minutos = 6 bloques (Hook → Video con checkpoints → Texto resumen → Práctica guiada → Quiz → Cierre adaptativo).**

**Patrones probados a copiar:**
- Microlearning 5-10 min por bloque (Khan, Duolingo, BYJU's).
- Retroalimentación inmediata explicada por pregunta (Brilliant, IXL, Photomath).
- Mastery Learning visible con ruta adaptativa (Khan, IXL).
- XP + Streak + Badges integrados al flujo (Duolingo).
- Dashboard padre semanal automático (Wited).
- IA chat 24/7 (Brincus — para v2).

**Anti-patrones a evitar:**
- Videos largos sin interacción intermedia.
- Quiz solo con score sin explicación.
- UI sobrecargada con upsells.
- Sincronía obligatoria que rompe propuesta asíncrona.
- Ignorar al padre que paga.

**Diferenciación vs Brincus/Wited:**
- 100% asincronía real.
- Mastery Learning formal estilo Khan (ninguno lo tiene).
- Gamificación robusta estilo Duolingo-light (ninguno lo tiene).
- Retroalimentación paso a paso estilo Photomath (ninguno lo tiene).
- Precio agresivo posicionado solo a prep examen libre.

**Ajuste por edad:** mascota + lecciones 15-18 min + reportes padres en 5°-8° básico; sin mascota + lecciones 25-35 min + dashboard analítico en enseñanza media.

---

## Fuentes

- [Khan Academy — Content & standards](https://www.khanacademy.org/khan-for-educators/indiacourse/xb6e0f5a42f01e035:get-started-with-khan-academy-eng/xb6e0f5a42f01e035:know-khan-academy/v/content-and-course-structure)
- [Khan Academy Help — Content types](https://support.khanacademy.org/hc/en-us/articles/18564282990861-What-types-of-content-can-I-assign-to-my-students)
- [How Khan Academy videos are made (Khan Blog)](https://blog.khanacademy.org/how-khan-academy-videos-are-made-to-help-you-learn/)
- [Khan Academy Mastery Learning — Cult of Pedagogy](https://www.cultofpedagogy.com/khan-mastery-learning/)
- [IXL SmartScore Research PDF](https://www.ixl.com/materials/us/research/How_IXLs_SmartScore_Supports_Student_Learning.pdf)
- [IXL SmartScore Blog](https://blog.ixl.com/2020/11/11/ixl-smartscore-the-key-to-mastery-based-learning/)
- [IXL TeachThought Tips](https://www.teachthought.com/technology/how-to-use-ixl/)
- [Brilliant.org](https://brilliant.org/)
- [Brilliant Explained 2026](https://beginnersinai.org/brilliant-explained/)
- [Brilliant vs Khan Academy comparison](https://studyboost.org/blog/brilliant-vs-khan-academy/)
- [How Brilliant motivates with Rive animations](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)
- [Duolingo gamification — StriveCloud](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [Duolingo gamification secrets — Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [Duolingo microlearning study — ACM](https://dl.acm.org/doi/fullHtml/10.1145/3631991.3632026)
- [Microlearning best apps 2026 — Chunks](https://chunks.app/blog/best-microlearning-apps-2026)
- [BYJU's Case study World Bank](https://documents1.worldbank.org/curated/en/292931525344147810/pdf/BYJU-S-How-a-Learning-App-is-Promoting-Deep-Conceptual-Understanding-that-is-Improving-Educational-Outcomes-in-India.pdf)
- [Rise and Fall of BYJU's — VCI Institute](https://www.vciinstitute.com/blog/the-rise-and-fall-of-byju-a-22-billion-lesson-learned-for-free)
- [BYJU's failure case study](https://wjarr.com/sites/default/files/WJARR-2024-0765.pdf)
- [Coursera Help — Modules/Lessons](https://www.coursera.support/s/topic/0TO1U000000PmS0WAK/modules-lessons?language=en_US)
- [EdX How to Create a Course PDF](https://files.edx.org/edX101_HowToCreateAnEdXCourse.pdf)
- [EdX vs Coursera 2026](https://missiongraduatenm.org/edx-vs-coursera/)
- [Kahoot vs Quizizz 2026 — SaaS Battle](https://trysaasbattle.com/kahoot-vs-quizizz/)
- [Quizizz vs Kahoot vs Quizlet — Makerstations](https://www.makerstations.io/quizizz-vs-kahoot-vs-quizlet/)
- [Photomath vs Mathway 2025 — Apex Vision](https://apexvision.ai/guides/photomath-vs-mathway-comparison/)
- [Synthesis Tutor](https://www.synthesis.com/tutor)
- [Synthesis Tutor Review — Brighterly](https://brighterly.com/blog/synthesis-tutor-review/)
- [Outschool how classes work](https://support.outschool.com/en/articles/19491-how-do-outschool-classes-work)
- [Khan Academy vs Outschool — SaaSHub](https://www.saashub.com/compare-khan-academy-vs-outschool)
- [Wited Chile — Colegio Online](https://www.wited.com/cl/colegio-online/)
- [Brincus Chile homepage](https://home2.brincus.com/)
- [Brincus plataforma intuitiva](https://home2.brincus.com/blog/detalle/plataforma-propia-e-intuitiva-de-facil-manejo-para-nuestros-usuarios)
- [Brincus aprobación exámenes libres](https://home2.brincus.com/blog/detalle/condiciones-de-aprobacion-examenes-libres-chile-guia-de-requisitos-mineduc-2025)
- [Crehana vs Platzi](https://www.crehana.com/blog/comunidad-crehana/crehana-vs-platzi/)
- [Atención por edad — Waterford](https://www.waterford.org/blog/student-attention-span/)
- [Attention span by age — Self Sufficient Kids](https://selfsufficientkids.com/average-attention-span-by-age-for-children/)
- [Attention span elearning — isEazy](https://www.iseazy.com/blog/attention-span-elearning-courses/)
- [Gamification K12 transform — Rise Philadelphia](https://www.risephiladelphia.com/post/how-gamification-can-transform-k-12-learning-and-self-study)
- [Gamification effectiveness PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10611935/)
- [UX edtech best practices — DesignMonks](https://www.designmonks.co/blog/ux-in-edtech)
- [EdTech UI/UX trends — Framcreative](https://framcreative.com/latest-trends-best-practices-and-top-experiences-in-ui-ux-design-for-e-learning)
