import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ExamTest {
  id: string;
  exam_type: string;
  title: string;
  description: string | null;
  section: string;
  difficulty: string | null;
  duration_minutes: number | null;
  total_questions: number | null;
  is_mock_exam: boolean | null;
  points_value: number | null;
}

interface ExamProgress {
  id: string;
  user_id: string;
  exam_type: string;
  current_band: number | null;
  target_band: number | null;
  tests_completed: number | null;
  total_study_minutes: number | null;
  listening_score: number | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  math_score: number | null;
}

interface ExamAttempt {
  id: string;
  user_id: string;
  test_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  max_score: number | null;
  band_score: number | null;
  cefr_level: string | null;
  time_spent_seconds: number | null;
  status: string | null;
  test?: ExamTest;
}

export const useExamPrep = (examType?: string) => {
  const { user } = useAuth();
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [progress, setProgress] = useState<ExamProgress | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    let query = supabase
      .from("exam_tests")
      .select("*")
      .order("section")
      .order("title");

    if (examType) {
      query = query.eq("exam_type", examType as any);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTests(data);
    }
    setLoading(false);
  }, [examType]);

  const fetchProgress = useCallback(async () => {
    if (!user || !examType) return;

    const { data } = await supabase
      .from("exam_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("exam_type", examType as any)
      .single();

    if (data) {
      setProgress(data);
    }
  }, [user, examType]);

  const fetchRecentAttempts = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from("exam_attempts")
      .select(`
        *,
        test:exam_tests(*)
      `)
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10);

    if (examType) {
      query = query.eq("test.exam_type", examType);
    }

    const { data } = await query;

    if (data) {
      setRecentAttempts(data);
    }
  }, [user, examType]);

  const startTest = async (testId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        test_id: testId,
        status: "in_progress"
      })
      .select()
      .single();

    return { data, error };
  };

  const submitAnswer = async (
    attemptId: string, 
    answers: Record<string, string>,
    score: number,
    maxScore: number,
    timeSpent: number
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Calculate band score for IELTS
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    let bandScore = null;
    let cefrLevel = null;

    if (examType === "ielts") {
      if (percentage >= 90) bandScore = 9.0;
      else if (percentage >= 80) bandScore = 8.0;
      else if (percentage >= 70) bandScore = 7.0;
      else if (percentage >= 60) bandScore = 6.0;
      else if (percentage >= 50) bandScore = 5.0;
      else if (percentage >= 40) bandScore = 4.0;
      else bandScore = 3.0;
    } else if (examType === "cefr") {
      if (percentage >= 90) cefrLevel = "C2";
      else if (percentage >= 80) cefrLevel = "C1";
      else if (percentage >= 70) cefrLevel = "B2";
      else if (percentage >= 55) cefrLevel = "B1";
      else if (percentage >= 40) cefrLevel = "A2";
      else cefrLevel = "A1";
    }

    const { error } = await supabase
      .from("exam_attempts")
      .update({
        answers,
        score,
        max_score: maxScore,
        band_score: bandScore,
        cefr_level: cefrLevel,
        time_spent_seconds: timeSpent,
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", attemptId);

    if (!error && examType && user) {
      // Update progress
      await supabase
        .from("exam_progress")
        .upsert({
          user_id: user.id,
          exam_type: examType as any,
          current_band: bandScore,
          tests_completed: (progress?.tests_completed || 0) + 1,
          total_study_minutes: (progress?.total_study_minutes || 0) + Math.floor(timeSpent / 60)
        }, { onConflict: "user_id,exam_type" });

      await fetchProgress();
      await fetchRecentAttempts();
    }

    return { error };
  };

  const takeLevelTest = async () => {
    // Find level test for this exam type
    const levelTest = tests.find(t => 
      t.title.toLowerCase().includes("level test") || 
      t.section === "full"
    );

    if (levelTest) {
      return startTest(levelTest.id);
    }

    return { error: new Error("No level test available") };
  };

  useEffect(() => {
    fetchTests();
    if (user && examType) {
      fetchProgress();
      fetchRecentAttempts();
    }
  }, [fetchTests, fetchProgress, fetchRecentAttempts, user, examType]);

  return {
    tests,
    progress,
    recentAttempts,
    loading,
    startTest,
    submitAnswer,
    takeLevelTest,
    refetch: fetchTests
  };
};
