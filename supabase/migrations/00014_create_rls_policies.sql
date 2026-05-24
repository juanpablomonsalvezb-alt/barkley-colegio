-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reinforcement_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_jobs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_select_children ON profiles FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY profiles_select_admin ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SUBJECTS (public read)
CREATE POLICY subjects_select ON subjects FOR SELECT USING (true);
CREATE POLICY subjects_modify_admin ON subjects FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- COURSES
CREATE POLICY courses_select_published ON courses FOR SELECT USING (is_published = true);
CREATE POLICY courses_select_admin ON courses FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY courses_modify_admin ON courses FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- UNITS
CREATE POLICY units_select_published ON units FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_published = true));
CREATE POLICY units_modify_admin ON units FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- LESSONS
CREATE POLICY lessons_select_published ON lessons FOR SELECT USING (is_published = true AND EXISTS (SELECT 1 FROM units u JOIN courses c ON c.id = u.course_id WHERE u.id = unit_id AND u.is_published = true AND c.is_published = true));
CREATE POLICY lessons_modify_admin ON lessons FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- LESSON RESOURCES
CREATE POLICY lesson_resources_select ON lesson_resources FOR SELECT USING (EXISTS (SELECT 1 FROM lessons WHERE id = lesson_id AND is_published = true));
CREATE POLICY lesson_resources_modify_admin ON lesson_resources FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- QUIZZES
CREATE POLICY quizzes_select_published ON quizzes FOR SELECT USING (is_published = true);
CREATE POLICY quizzes_modify_admin ON quizzes FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- QUESTIONS
CREATE POLICY questions_select ON questions FOR SELECT USING (EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id AND is_published = true));
CREATE POLICY questions_modify_admin ON questions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ADAPTIVE RULES
CREATE POLICY adaptive_rules_select ON adaptive_rules FOR SELECT USING (true);
CREATE POLICY adaptive_rules_modify_admin ON adaptive_rules FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- REINFORCEMENT QUESTIONS
CREATE POLICY reinforcement_q_select ON reinforcement_questions FOR SELECT USING (true);
CREATE POLICY reinforcement_q_modify_admin ON reinforcement_questions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- PROGRESS
CREATE POLICY course_progress_own ON course_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY course_progress_parent ON course_progress FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()));
CREATE POLICY course_progress_admin ON course_progress FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY lesson_progress_own ON lesson_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY lesson_progress_parent ON lesson_progress FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()));

CREATE POLICY quiz_attempts_own ON quiz_attempts FOR ALL USING (student_id = auth.uid());
CREATE POLICY quiz_attempts_parent ON quiz_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()));

CREATE POLICY daily_activity_own ON daily_activity FOR ALL USING (student_id = auth.uid());

-- GAMIFICATION
CREATE POLICY achievements_select ON achievements FOR SELECT USING (true);
CREATE POLICY achievements_modify_admin ON achievements FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY student_achievements_own ON student_achievements FOR ALL USING (student_id = auth.uid());
CREATE POLICY student_achievements_parent ON student_achievements FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()));

CREATE POLICY student_stats_own ON student_stats FOR ALL USING (student_id = auth.uid());
CREATE POLICY student_stats_parent ON student_stats FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()));

-- PAYMENTS
CREATE POLICY payments_payer ON payments FOR SELECT USING (payer_id = auth.uid());
CREATE POLICY payments_admin ON payments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- PRICING PLANS
CREATE POLICY plans_select ON pricing_plans FOR SELECT USING (is_active = true);
CREATE POLICY plans_admin ON pricing_plans FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ENROLLMENTS
CREATE POLICY enrollments_student ON enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY enrollments_parent ON enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()));
CREATE POLICY enrollments_admin ON enrollments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- NOTIFICATIONS
CREATE POLICY notifications_own ON notifications FOR ALL USING (user_id = auth.uid());

-- SPACED REPETITION
CREATE POLICY review_cards_own ON review_cards FOR ALL USING (student_id = auth.uid());
CREATE POLICY review_logs_own ON review_logs FOR ALL USING (student_id = auth.uid());

-- CONTENT GENERATION
CREATE POLICY content_gen_admin ON content_generation_jobs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
