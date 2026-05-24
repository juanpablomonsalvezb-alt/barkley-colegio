export const GRADE_LEVELS = [
  { value: '5_basico', label: '5° Básico' },
  { value: '6_basico', label: '6° Básico' },
  { value: '7_basico', label: '7° Básico' },
  { value: '8_basico', label: '8° Básico' },
  { value: '1_medio', label: '1° Medio' },
  { value: '2_medio', label: '2° Medio' },
  { value: '3_medio', label: '3° Medio' },
  { value: '4_medio', label: '4° Medio' },
] as const

export const QUESTION_TYPES = [
  { value: 'opcion_multiple', label: 'Opción Múltiple' },
  { value: 'verdadero_falso', label: 'Verdadero / Falso' },
  { value: 'completar', label: 'Completar' },
  { value: 'ordenar', label: 'Ordenar' },
  { value: 'asociar', label: 'Asociar' },
] as const

export const ADAPTIVE_PATHS = {
  refuerzo: { label: 'Refuerzo', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  normal: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  desafio: { label: 'Desafío', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
} as const

export const SUBJECT_COLORS: Record<string, string> = {
  matematicas: '#3B82F6',
  lenguaje: '#EF4444',
  ciencias: '#10B981',
  historia: '#F59E0B',
  ingles: '#8B5CF6',
  'educacion-fisica': '#EC4899',
  artes: '#14B8A6',
  musica: '#F97316',
  tecnologia: '#6366F1',
  orientacion: '#84CC16',
}
