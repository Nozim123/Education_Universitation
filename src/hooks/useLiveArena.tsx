import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ArenaSession {
  id: string;
  title: string;
  description: string | null;
  host_id: string | null;
  category_id: string | null;
  status: string;
  max_participants: number | null;
  current_question: number | null;
  total_questions: number | null;
  question_time_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}

interface ArenaQuestion {
  id: string;
  question_text: string;
  options: { id: string; text: string }[];
  correct_option_id: string;
  points: number | null;
  order_index: number;
}

interface ArenaParticipant {
  id: string;
  session_id: string;
  user_id: string;
  score: number | null;
  correct_answers: number | null;
  wrong_answers: number | null;
  current_streak: number | null;
  best_streak: number | null;
  rank: number | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useLiveArena = (sessionId?: string) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ArenaSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ArenaSession | null>(null);
  const [questions, setQuestions] = useState<ArenaQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<ArenaQuestion | null>(null);
  const [participants, setParticipants] = useState<ArenaParticipant[]>([]);
  const [leaderboard, setLeaderboard] = useState<ArenaParticipant[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from("arena_sessions")
      .select("*")
      .in("status", ["waiting", "starting", "active"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
    setLoading(false);
  }, []);

  // Fetch session details
  const fetchSession = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("arena_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setCurrentSession(data);
    }
  }, []);

  // Fetch questions for a session
  const fetchQuestions = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("arena_questions")
      .select("*")
      .eq("session_id", id)
      .order("order_index");

    if (data) {
      setQuestions(data.map(q => ({
        ...q,
        options: q.options as { id: string; text: string }[]
      })));
    }
  }, []);

  // Fetch participants with profiles
  const fetchParticipants = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("arena_participants")
      .select(`
        *,
        profile:profiles!arena_participants_user_id_fkey(first_name, last_name, avatar_url)
      `)
      .eq("session_id", id)
      .order("score", { ascending: false });

    if (data) {
      const sorted = data.map((p, idx) => ({ ...p, rank: idx + 1 }));
      setParticipants(sorted);
      setLeaderboard(sorted.slice(0, 10));
    }
  }, []);

  // Join session
  const joinSession = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("arena_participants")
      .insert({ session_id: id, user_id: user.id });

    if (!error) {
      await fetchParticipants(id);
    }

    return { error };
  };

  // Submit answer
  const submitAnswer = async (questionId: string, optionId: string, timeMs: number) => {
    if (!user || !currentSession || hasAnswered) return { error: new Error("Cannot submit") };

    const question = questions.find(q => q.id === questionId);
    if (!question) return { error: new Error("Question not found") };

    const isCorrect = optionId === question.correct_option_id;
    const basePoints = question.points || 10;
    const timeBonus = Math.max(0, Math.floor((1 - timeMs / ((currentSession.question_time_seconds || 30) * 1000)) * basePoints * 0.5));
    const pointsEarned = isCorrect ? basePoints + timeBonus : 0;

    const { error } = await supabase
      .from("arena_answers")
      .insert({
        session_id: currentSession.id,
        question_id: questionId,
        user_id: user.id,
        selected_option_id: optionId,
        is_correct: isCorrect,
        answer_time_ms: timeMs,
        points_earned: pointsEarned
      });

    if (!error) {
      setHasAnswered(true);
      
      // Update participant score
      await supabase
        .from("arena_participants")
        .update({
          score: supabase.rpc ? undefined : 0, // Will use RPC in production
          correct_answers: isCorrect ? 1 : 0,
          wrong_answers: isCorrect ? 0 : 1
        })
        .eq("session_id", currentSession.id)
        .eq("user_id", user.id);

      await fetchParticipants(currentSession.id);
    }

    return { error, isCorrect, pointsEarned };
  };

  // Generate AI questions for a session
  const generateQuestions = async (sessionId: string, category: string, difficulty: string, count: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { category, difficulty, questionCount: count }
      });

      if (error) throw error;

      const questions = data.questions;
      
      // Insert questions into database
      const questionsToInsert = questions.map((q: any, idx: number) => ({
        session_id: sessionId,
        question_text: q.question_text,
        options: q.options,
        correct_option_id: q.correct_option_id,
        points: q.points,
        order_index: idx
      }));

      const { error: insertError } = await supabase
        .from("arena_questions")
        .insert(questionsToInsert);

      if (insertError) throw insertError;

      return { success: true, count: questions.length };
    } catch (err) {
      console.error("Failed to generate questions:", err);
      return { error: err };
    }
  };

  // Create new session
  const createSession = async (data: {
    title: string;
    description?: string;
    category_id?: string;
    total_questions?: number;
    question_time_seconds?: number;
    generateAI?: boolean;
    category?: string;
    difficulty?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data: session, error } = await supabase
      .from("arena_sessions")
      .insert({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        total_questions: data.total_questions,
        question_time_seconds: data.question_time_seconds,
        host_id: user.id
      })
      .select()
      .single();

    if (!error && session && data.generateAI) {
      // Generate AI questions for the session
      await generateQuestions(
        session.id, 
        data.category || data.title, 
        data.difficulty || "intermediate",
        data.total_questions || 10
      );
    }

    if (!error) {
      await fetchSessions();
    }

    return { data: session, error };
  };

  // Start session
  const startSession = async (id: string) => {
    const { error } = await supabase
      .from("arena_sessions")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  };

  // Next question
  const nextQuestion = async () => {
    if (!currentSession) return;
    
    const nextIdx = (currentSession.current_question || 0) + 1;
    
    await supabase
      .from("arena_sessions")
      .update({ current_question: nextIdx })
      .eq("id", currentSession.id);
  };

  // Timer effect
  useEffect(() => {
    if (currentSession?.status === "active" && currentQuestion) {
      const questionTime = currentSession.question_time_seconds || 30;
      setTimeLeft(questionTime);
      setHasAnswered(false);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [currentSession?.status, currentQuestion?.id]);

  // Update current question when session changes
  useEffect(() => {
    if (currentSession && questions.length > 0) {
      const qIdx = currentSession.current_question || 0;
      setCurrentQuestion(questions[qIdx] || null);
    }
  }, [currentSession?.current_question, questions]);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch session details if ID provided
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
      fetchQuestions(sessionId);
      fetchParticipants(sessionId);
    }
  }, [sessionId, fetchSession, fetchQuestions, fetchParticipants]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("arena-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "arena_sessions"
      }, (payload) => {
        if (payload.eventType === "UPDATE" && sessionId) {
          setCurrentSession(payload.new as ArenaSession);
        }
        fetchSessions();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "arena_participants",
        filter: sessionId ? `session_id=eq.${sessionId}` : undefined
      }, () => {
        if (sessionId) fetchParticipants(sessionId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchSessions, fetchParticipants]);

  return {
    sessions,
    currentSession,
    questions,
    currentQuestion,
    participants,
    leaderboard,
    timeLeft,
    hasAnswered,
    loading,
    joinSession,
    submitAnswer,
    createSession,
    startSession,
    nextQuestion,
    generateQuestions,
    refetch: fetchSessions
  };
};
