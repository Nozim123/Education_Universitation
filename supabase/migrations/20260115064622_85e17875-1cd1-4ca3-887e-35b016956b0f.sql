-- Live Arena Tables
CREATE TABLE public.arena_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'active', 'finished')),
  max_participants INTEGER DEFAULT 100,
  current_question INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  question_time_seconds INTEGER DEFAULT 30,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.arena_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.arena_sessions(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id, text}
  correct_option_id TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.arena_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.arena_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

CREATE TABLE public.arena_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.arena_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.arena_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answer_time_ms INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Mentor Queue Tables
CREATE TABLE public.mentor_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'accepted', 'in_progress', 'completed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  queue_position INTEGER,
  estimated_wait_minutes INTEGER,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skill Duel Tables
CREATE TABLE public.skill_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'accepted', 'active', 'voting', 'finished', 'cancelled')),
  challenger_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_round INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 5,
  round_time_seconds INTEGER DEFAULT 60,
  stake_points INTEGER DEFAULT 50,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.duel_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID REFERENCES public.skill_duels(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  challenger_answer TEXT,
  opponent_answer TEXT,
  challenger_time_ms INTEGER,
  opponent_time_ms INTEGER,
  round_winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.duel_spectators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID REFERENCES public.skill_duels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_for UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(duel_id, user_id)
);

-- Online Status Tracking
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_page TEXT,
  current_activity TEXT,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  session_started TIMESTAMPTZ DEFAULT now()
);

-- Admin Activity Logs
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.arena_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_spectators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Arena Policies
CREATE POLICY "Anyone can view active arena sessions" ON public.arena_sessions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create arena sessions" ON public.arena_sessions FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their sessions" ON public.arena_sessions FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Participants can view questions" ON public.arena_questions FOR SELECT USING (true);
CREATE POLICY "Hosts can manage questions" ON public.arena_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.arena_sessions WHERE id = session_id AND host_id = auth.uid())
);

CREATE POLICY "Anyone can view participants" ON public.arena_participants FOR SELECT USING (true);
CREATE POLICY "Users can join sessions" ON public.arena_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update participants" ON public.arena_participants FOR UPDATE USING (true);

CREATE POLICY "Users can submit answers" ON public.arena_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their answers" ON public.arena_answers FOR SELECT USING (true);

-- Mentor Queue Policies
CREATE POLICY "Anyone can view queue" ON public.mentor_queue FOR SELECT USING (true);
CREATE POLICY "Users can request help" ON public.mentor_queue FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their requests" ON public.mentor_queue FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = mentor_id);

-- Duel Policies
CREATE POLICY "Anyone can view duels" ON public.skill_duels FOR SELECT USING (true);
CREATE POLICY "Users can create duels" ON public.skill_duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Participants can update duels" ON public.skill_duels FOR UPDATE USING (auth.uid() IN (challenger_id, opponent_id));

CREATE POLICY "Anyone can view rounds" ON public.duel_rounds FOR SELECT USING (true);
CREATE POLICY "Duel participants can manage rounds" ON public.duel_rounds FOR ALL USING (
  EXISTS (SELECT 1 FROM public.skill_duels WHERE id = duel_id AND (challenger_id = auth.uid() OR opponent_id = auth.uid()))
);

CREATE POLICY "Anyone can view spectators" ON public.duel_spectators FOR SELECT USING (true);
CREATE POLICY "Users can spectate" ON public.duel_spectators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can vote" ON public.duel_spectators FOR UPDATE USING (auth.uid() = user_id);

-- Presence Policies
CREATE POLICY "Anyone can view presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can manage their presence" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

-- Admin Policies
CREATE POLICY "Admins can view logs" ON public.admin_activity_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create logs" ON public.admin_activity_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_duels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_spectators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;