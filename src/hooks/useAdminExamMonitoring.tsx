import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ExamStats {
  activeExams: number;
  completedToday: number;
  avgScore: number;
  mostMissedQuestions: { question: string; wrongCount: number }[];
  mentorsOnline: number;
  flaggedAttempts: number;
}

interface ExamAttemptWithDetails {
  id: string;
  user_id: string;
  test_id: string;
  status: string;
  score: number | null;
  max_score: number | null;
  band_score: number | null;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  test?: {
    title: string;
    exam_type: string;
    section: string;
  };
}

export const useAdminExamMonitoring = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExamStats>({
    activeExams: 0,
    completedToday: 0,
    avgScore: 0,
    mostMissedQuestions: [],
    mentorsOnline: 0,
    flaggedAttempts: 0,
  });
  const [activeAttempts, setActiveAttempts] = useState<ExamAttemptWithDetails[]>([]);
  const [recentCompleted, setRecentCompleted] = useState<ExamAttemptWithDetails[]>([]);

  // Fetch exam statistics
  const fetchStats = useCallback(async () => {
    try {
      // Get active exam attempts (in_progress)
      const { data: activeData, count: activeCount } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          profile:profiles!exam_attempts_user_id_fkey(first_name, last_name, email),
          test:exam_tests(title, exam_type, section)
        `, { count: "exact" })
        .eq("status", "in_progress")
        .order("started_at", { ascending: false });

      if (activeData) {
        setActiveAttempts(activeData as ExamAttemptWithDetails[]);
      }

      // Get today's completed attempts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: completedData, count: completedCount } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          profile:profiles!exam_attempts_user_id_fkey(first_name, last_name, email),
          test:exam_tests(title, exam_type, section)
        `, { count: "exact" })
        .eq("status", "completed")
        .gte("completed_at", today.toISOString())
        .order("completed_at", { ascending: false })
        .limit(20);

      if (completedData) {
        setRecentCompleted(completedData as ExamAttemptWithDetails[]);
      }

      // Calculate average score from completed exams
      const { data: scoreData } = await supabase
        .from("exam_attempts")
        .select("score, max_score")
        .eq("status", "completed")
        .not("score", "is", null)
        .not("max_score", "is", null);

      let avgScore = 0;
      if (scoreData && scoreData.length > 0) {
        const totalPercentage = scoreData.reduce((acc, attempt) => {
          if (attempt.max_score && attempt.max_score > 0) {
            return acc + (attempt.score! / attempt.max_score) * 100;
          }
          return acc;
        }, 0);
        avgScore = totalPercentage / scoreData.length;
      }

      // Get online mentors count
      const { count: mentorCount } = await supabase
        .from("user_presence")
        .select("*", { count: "exact", head: true })
        .eq("is_online", true);

      // Check for flagged attempts (unusually fast completions or score anomalies)
      const { data: flaggedData } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("status", "completed")
        .lt("time_spent_seconds", 300) // Completed in less than 5 minutes
        .gte("score", 90); // With very high score - suspicious

      setStats({
        activeExams: activeCount || 0,
        completedToday: completedCount || 0,
        avgScore: Math.round(avgScore),
        mostMissedQuestions: [], // Would need more complex query
        mentorsOnline: mentorCount || 0,
        flaggedAttempts: flaggedData?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch exam stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchStats();

    // Subscribe to exam_attempts changes
    const channel = supabase
      .channel("admin-exam-monitoring")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exam_attempts",
        },
        (payload) => {
          console.log("Exam attempt change:", payload);
          fetchStats(); // Refresh stats on any change
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchStats]);

  // Freeze a suspicious exam attempt
  const freezeAttempt = useCallback(async (attemptId: string, reason: string) => {
    const { error } = await supabase
      .from("exam_attempts")
      .update({ 
        status: "frozen",
        // Could add a notes field for the reason
      })
      .eq("id", attemptId);

    if (!error) {
      // Log the action
      if (user) {
        await supabase.from("admin_activity_logs").insert({
          admin_id: user.id,
          action: "freeze_exam",
          target_type: "exam_attempt",
          target_id: attemptId,
          details: { reason },
        });
      }
      fetchStats();
    }

    return { error };
  }, [user, fetchStats]);

  // Invalidate an exam result
  const invalidateResult = useCallback(async (attemptId: string, reason: string) => {
    const { error } = await supabase
      .from("exam_attempts")
      .update({ 
        status: "invalidated",
        score: null,
        band_score: null,
        cefr_level: null,
      })
      .eq("id", attemptId);

    if (!error && user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "invalidate_exam",
        target_type: "exam_attempt",
        target_id: attemptId,
        details: { reason },
      });
      fetchStats();
    }

    return { error };
  }, [user, fetchStats]);

  return {
    loading,
    stats,
    activeAttempts,
    recentCompleted,
    freezeAttempt,
    invalidateResult,
    refetch: fetchStats,
  };
};
