-- Enums for Barkley platform
CREATE TYPE user_role AS ENUM ('estudiante', 'apoderado', 'admin');

CREATE TYPE grade_level AS ENUM (
  '5_basico', '6_basico', '7_basico', '8_basico',
  '1_medio', '2_medio', '3_medio', '4_medio'
);

CREATE TYPE enrollment_status AS ENUM ('pendiente', 'activa', 'suspendida', 'cancelada', 'completada');
CREATE TYPE payment_status AS ENUM ('pendiente', 'pagado', 'fallido', 'reembolsado', 'vencido');
CREATE TYPE payment_method AS ENUM ('transbank', 'khipu', 'transferencia_manual');
CREATE TYPE lesson_type AS ENUM ('video', 'texto', 'mixto');

CREATE TYPE question_type AS ENUM (
  'opcion_multiple',
  'verdadero_falso',
  'completar',
  'ordenar',
  'asociar'
);

CREATE TYPE adaptive_path AS ENUM ('refuerzo', 'normal', 'desafio');
CREATE TYPE content_gen_status AS ENUM ('pendiente', 'generando', 'revision', 'aprobado', 'rechazado');

CREATE TYPE notification_type AS ENUM (
  'pago_pendiente', 'pago_confirmado', 'pago_fallido',
  'progreso_bajo', 'logro_obtenido', 'leccion_completada',
  'quiz_completado', 'repaso_pendiente', 'matricula_aprobada'
);

CREATE TYPE review_rating AS ENUM ('again', 'hard', 'good', 'easy');
