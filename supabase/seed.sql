-- Seed: Subjects
INSERT INTO subjects (name, slug, icon_url, color, display_order) VALUES
  ('Matemáticas', 'matematicas', '/icons/math.svg', '#3B82F6', 1),
  ('Lenguaje y Comunicación', 'lenguaje', '/icons/language.svg', '#EF4444', 2),
  ('Ciencias Naturales', 'ciencias', '/icons/science.svg', '#10B981', 3),
  ('Historia y Geografía', 'historia', '/icons/history.svg', '#F59E0B', 4),
  ('Inglés', 'ingles', '/icons/english.svg', '#8B5CF6', 5),
  ('Educación Física', 'educacion-fisica', '/icons/pe.svg', '#EC4899', 6),
  ('Artes Visuales', 'artes', '/icons/art.svg', '#14B8A6', 7),
  ('Música', 'musica', '/icons/music.svg', '#F97316', 8),
  ('Tecnología', 'tecnologia', '/icons/tech.svg', '#6366F1', 9),
  ('Orientación', 'orientacion', '/icons/guidance.svg', '#84CC16', 10);

-- Seed: Pricing Plans
INSERT INTO pricing_plans (name, slug, grade_levels, monthly_price_clp, description, features) VALUES
  ('Plan Básica', 'plan-basica', ARRAY['5_basico','6_basico','7_basico','8_basico']::grade_level[], 35000, 'Educación básica completa (5° a 8°)', '["Acceso completo a todas las asignaturas", "Quizzes con retroalimentación", "Reportes para apoderados", "Sistema de logros y gamificación", "Preparación exámenes libres MINEDUC"]'::jsonb),
  ('Plan Media', 'plan-media', ARRAY['1_medio','2_medio','3_medio','4_medio']::grade_level[], 45000, 'Educación media completa (1° a 4°)', '["Acceso completo a todas las asignaturas", "Quizzes con retroalimentación", "Reportes para apoderados", "Sistema de logros y gamificación", "Preparación exámenes libres MINEDUC", "Material PSU/PAES preparación"]'::jsonb),
  ('Plan Premium', 'plan-premium', ARRAY['5_basico','6_basico','7_basico','8_basico','1_medio','2_medio','3_medio','4_medio']::grade_level[], 55000, 'Acceso completo básica + media', '["Todo del Plan Básica y Media", "Contenido de desafío avanzado", "Proyectos prácticos", "Reportes detallados semanales", "Soporte prioritario"]'::jsonb);

-- Seed: Achievements
INSERT INTO achievements (slug, title, description, icon_url, category, condition_type, condition_value, xp_reward) VALUES
  ('first_lesson', 'Primera Lección', 'Completaste tu primera lección', '/badges/first-lesson.svg', 'leccion', 'lessons_completed', 1, 10),
  ('five_lessons', 'Explorador', 'Completaste 5 lecciones', '/badges/five-lessons.svg', 'leccion', 'lessons_completed', 5, 25),
  ('twenty_lessons', 'Estudioso', 'Completaste 20 lecciones', '/badges/twenty-lessons.svg', 'leccion', 'lessons_completed', 20, 50),
  ('fifty_lessons', 'Académico', 'Completaste 50 lecciones', '/badges/fifty-lessons.svg', 'leccion', 'lessons_completed', 50, 100),
  ('first_quiz', 'Primer Quiz', 'Completaste tu primer quiz', '/badges/first-quiz.svg', 'quiz', 'quizzes_completed', 1, 10),
  ('perfect_score', 'Perfección', 'Obtuviste 100% en un quiz', '/badges/perfect-score.svg', 'quiz', 'quizzes_perfect', 1, 25),
  ('five_perfect', 'Genio', '5 quizzes perfectos', '/badges/five-perfect.svg', 'quiz', 'quizzes_perfect', 5, 75),
  ('streak_7', 'Constante', 'Racha de 7 días seguidos', '/badges/streak-7.svg', 'racha', 'streak_days', 7, 50),
  ('streak_30', 'Imparable', 'Racha de 30 días seguidos', '/badges/streak-30.svg', 'racha', 'streak_days', 30, 200),
  ('course_complete', 'Graduado', 'Completaste un curso completo', '/badges/course-complete.svg', 'curso', 'course_completed', 1, 500),
  ('challenge_master', 'Desafiante', '10 rutas de desafío completadas', '/badges/challenge-master.svg', 'especial', 'path_challenge', 10, 100),
  ('level_5', 'Nivel 5', 'Alcanzaste el nivel 5', '/badges/level-5.svg', 'especial', 'level_reached', 5, 50),
  ('level_10', 'Nivel 10', 'Alcanzaste el nivel 10', '/badges/level-10.svg', 'especial', 'level_reached', 10, 100),
  ('level_20', 'Nivel 20', 'Alcanzaste el nivel 20', '/badges/level-20.svg', 'especial', 'level_reached', 20, 250),
  ('review_warrior', 'Guerrero del Repaso', '50 sesiones de repaso', '/badges/review-warrior.svg', 'especial', 'reviews_completed', 50, 100);
