-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'estudiante')
  );

  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'estudiante') = 'estudiante' THEN
    INSERT INTO student_stats (student_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update course progress when lesson completed
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
  v_completed INT;
  v_total INT;
BEGIN
  SELECT c.id INTO v_course_id
  FROM lessons l
  JOIN units u ON u.id = l.unit_id
  JOIN courses c ON c.id = u.course_id
  WHERE l.id = NEW.lesson_id;

  SELECT COUNT(*) INTO v_completed
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  JOIN units u ON u.id = l.unit_id
  WHERE u.course_id = v_course_id
    AND lp.student_id = NEW.student_id
    AND lp.completed_at IS NOT NULL;

  SELECT COUNT(*) INTO v_total
  FROM lessons l
  JOIN units u ON u.id = l.unit_id
  WHERE u.course_id = v_course_id
    AND l.is_published = true;

  INSERT INTO course_progress (student_id, course_id, completed_lessons, total_lessons, completion_percent, last_accessed_at)
  VALUES (
    NEW.student_id, v_course_id, v_completed, v_total,
    CASE WHEN v_total > 0 THEN (v_completed::DECIMAL / v_total * 100) ELSE 0 END,
    now()
  )
  ON CONFLICT (student_id, course_id) DO UPDATE SET
    completed_lessons = v_completed,
    total_lessons = v_total,
    completion_percent = CASE WHEN v_total > 0 THEN (v_completed::DECIMAL / v_total * 100) ELSE 0 END,
    last_accessed_at = now(),
    completed_at = CASE WHEN v_completed >= v_total AND v_total > 0 THEN now() ELSE NULL END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_lesson_progress_update_course
  AFTER INSERT OR UPDATE OF completed_at ON lesson_progress
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION update_course_progress();

-- Get adaptive path based on score
CREATE OR REPLACE FUNCTION get_adaptive_path(
  p_lesson_id UUID,
  p_score_percent DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_rule RECORD;
BEGIN
  SELECT * INTO v_rule
  FROM adaptive_rules
  WHERE lesson_id = p_lesson_id
    AND p_score_percent >= min_score_percent
    AND p_score_percent <= max_score_percent
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'path', 'normal',
      'show_reinforcement', false,
      'show_challenge', false,
      'message_title', 'Buen trabajo',
      'message_body', 'Puedes continuar con la siguiente lección.',
      'xp_multiplier', 1.0
    );
  END IF;

  RETURN jsonb_build_object(
    'path', v_rule.path,
    'next_action', v_rule.next_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate student streak
CREATE OR REPLACE FUNCTION calculate_streak(p_student_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_date DATE := CURRENT_DATE;
  v_found BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM daily_activity
      WHERE student_id = p_student_id AND activity_date = v_date
    ) INTO v_found;

    EXIT WHEN NOT v_found;

    v_streak := v_streak + 1;
    v_date := v_date - INTERVAL '1 day';
  END LOOP;

  UPDATE student_stats
  SET current_streak = v_streak,
      longest_streak = GREATEST(longest_streak, v_streak),
      updated_at = now()
  WHERE student_id = p_student_id;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
