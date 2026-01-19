-- Create exam types enum
CREATE TYPE public.exam_type AS ENUM ('ielts', 'sat', 'cefr', 'toefl', 'topik', 'jlpt');

-- Create exam preparation tests table
CREATE TABLE public.exam_tests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_type exam_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    section TEXT NOT NULL, -- 'listening', 'reading', 'writing', 'speaking', 'math', etc.
    difficulty TEXT DEFAULT 'intermediate',
    duration_minutes INTEGER DEFAULT 60,
    total_questions INTEGER DEFAULT 0,
    is_mock_exam BOOLEAN DEFAULT false,
    points_value INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam questions table
CREATE TABLE public.exam_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.exam_tests(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'fill_blank', 'essay', 'audio'
    options JSONB, -- For multiple choice
    correct_answer TEXT,
    audio_url TEXT, -- For listening sections
    image_url TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user exam attempts table
CREATE TABLE public.exam_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    test_id UUID REFERENCES public.exam_tests(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    band_score DECIMAL(3,1), -- For IELTS (e.g., 6.5)
    cefr_level TEXT, -- For CEFR (A1-C2)
    time_spent_seconds INTEGER,
    answers JSONB, -- Store all answers
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user exam progress table (tracks overall progress per exam type)
CREATE TABLE public.exam_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_type exam_type NOT NULL,
    current_band DECIMAL(3,1), -- Current estimated band/level
    target_band DECIMAL(3,1), -- Target band/level
    tests_completed INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    listening_score INTEGER DEFAULT 0,
    reading_score INTEGER DEFAULT 0,
    writing_score INTEGER DEFAULT 0,
    speaking_score INTEGER DEFAULT 0,
    math_score INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, exam_type)
);

-- Enable RLS
ALTER TABLE public.exam_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_progress ENABLE ROW LEVEL SECURITY;

-- Policies for exam_tests (public read, admin write)
CREATE POLICY "Anyone can view exam tests"
ON public.exam_tests FOR SELECT
USING (true);

CREATE POLICY "Admins can manage exam tests"
ON public.exam_tests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for exam_questions (public read, admin write)
CREATE POLICY "Anyone can view exam questions"
ON public.exam_questions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage exam questions"
ON public.exam_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for exam_attempts (users own data)
CREATE POLICY "Users can view own attempts"
ON public.exam_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts"
ON public.exam_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
ON public.exam_attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policies for exam_progress (users own data)
CREATE POLICY "Users can view own progress"
ON public.exam_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
ON public.exam_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for exam tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_progress;

-- Add triggers for updated_at
CREATE TRIGGER update_exam_tests_updated_at
    BEFORE UPDATE ON public.exam_tests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_progress_updated_at
    BEFORE UPDATE ON public.exam_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample exam tests for IELTS
INSERT INTO public.exam_tests (exam_type, title, description, section, difficulty, duration_minutes, total_questions, is_mock_exam, points_value)
VALUES 
    ('ielts', 'IELTS Listening Practice 1', 'Practice test for IELTS listening section with 4 recordings', 'listening', 'intermediate', 40, 40, false, 15),
    ('ielts', 'IELTS Reading Academic 1', 'Academic reading test with 3 passages', 'reading', 'intermediate', 60, 40, false, 15),
    ('ielts', 'IELTS Writing Task 1', 'Graph description and data analysis', 'writing', 'intermediate', 20, 1, false, 20),
    ('ielts', 'IELTS Speaking Mock', 'Full speaking test simulation', 'speaking', 'intermediate', 15, 3, false, 20),
    ('ielts', 'IELTS Full Mock Exam', 'Complete IELTS Academic test simulation', 'full', 'intermediate', 180, 4, true, 50);

-- Insert sample exam tests for SAT
INSERT INTO public.exam_tests (exam_type, title, description, section, difficulty, duration_minutes, total_questions, is_mock_exam, points_value)
VALUES 
    ('sat', 'SAT Math - No Calculator', 'Math section without calculator', 'math', 'intermediate', 25, 20, false, 15),
    ('sat', 'SAT Math - Calculator', 'Math section with calculator allowed', 'math', 'intermediate', 55, 38, false, 15),
    ('sat', 'SAT Reading', 'Evidence-based reading passages', 'reading', 'intermediate', 65, 52, false, 20),
    ('sat', 'SAT Writing and Language', 'Grammar and writing skills test', 'writing', 'intermediate', 35, 44, false, 15),
    ('sat', 'SAT Full Practice Test', 'Complete SAT simulation', 'full', 'intermediate', 180, 154, true, 50);

-- Insert sample exam tests for CEFR
INSERT INTO public.exam_tests (exam_type, title, description, section, difficulty, duration_minutes, total_questions, is_mock_exam, points_value)
VALUES 
    ('cefr', 'CEFR Level Test', 'Determine your current CEFR level', 'full', 'beginner', 30, 30, false, 10),
    ('cefr', 'A2 Grammar Practice', 'Elementary grammar exercises', 'grammar', 'beginner', 20, 20, false, 10),
    ('cefr', 'B1 Listening Comprehension', 'Intermediate listening practice', 'listening', 'intermediate', 30, 25, false, 15),
    ('cefr', 'B2 Reading Practice', 'Upper-intermediate reading texts', 'reading', 'advanced', 40, 30, false, 15);

-- Insert sample exam tests for TOEFL
INSERT INTO public.exam_tests (exam_type, title, description, section, difficulty, duration_minutes, total_questions, is_mock_exam, points_value)
VALUES 
    ('toefl', 'TOEFL Reading Section', 'Academic reading passages', 'reading', 'intermediate', 60, 30, false, 20),
    ('toefl', 'TOEFL Listening Section', 'Lectures and conversations', 'listening', 'intermediate', 60, 28, false, 20),
    ('toefl', 'TOEFL Speaking Tasks', 'Independent and integrated speaking', 'speaking', 'intermediate', 20, 4, false, 20),
    ('toefl', 'TOEFL Writing Tasks', 'Integrated and independent essays', 'writing', 'intermediate', 50, 2, false, 20),
    ('toefl', 'TOEFL iBT Full Test', 'Complete TOEFL iBT simulation', 'full', 'intermediate', 190, 64, true, 60);