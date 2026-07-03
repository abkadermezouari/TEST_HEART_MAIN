-- ── Quiz tables ────────────────────────────────────────────────
CREATE TABLE public.quizzes (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  title      text NOT NULL DEFAULT 'Quiz',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id)
);

CREATE TABLE public.quiz_questions (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id        uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question       text NOT NULL,
  options        jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation    text,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_quiz_results (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id      uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score        integer NOT NULL DEFAULT 0,
  max_score    integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quiz_id)
);

-- RLS
ALTER TABLE public.quizzes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des quiz"
  ON public.quizzes FOR SELECT USING (true);

CREATE POLICY "Lecture publique des questions"
  ON public.quiz_questions FOR SELECT USING (true);

CREATE POLICY "Lecture de ses propres resultats"
  ON public.user_quiz_results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insertion de ses propres resultats"
  ON public.user_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mise a jour de ses propres resultats"
  ON public.user_quiz_results FOR UPDATE USING (auth.uid() = user_id);

-- ── patient_alerts — politique UPDATE manquante ────────────────
-- La politique SELECT existe mais pas UPDATE : marquer comme lu échoue sans ceci
CREATE POLICY "Marquer une alerte comme lue"
  ON public.patient_alerts FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = nutritionist_id)
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = nutritionist_id);
