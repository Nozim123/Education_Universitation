import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SkillDuel {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  category_id: string | null;
  status: string;
  challenger_score: number | null;
  opponent_score: number | null;
  winner_id: string | null;
  current_round: number | null;
  total_rounds: number | null;
  round_time_seconds: number | null;
  stake_points: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
  challenger?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    total_points: number | null;
  };
  opponent?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    total_points: number | null;
  };
  category?: {
    name: string;
  };
}

interface DuelRound {
  id: string;
  duel_id: string;
  round_number: number;
  question_text: string;
  options: { id: string; text: string }[];
  correct_option_id: string;
  challenger_answer: string | null;
  opponent_answer: string | null;
  challenger_time_ms: number | null;
  opponent_time_ms: number | null;
  round_winner_id: string | null;
}

interface Spectator {
  id: string;
  user_id: string;
  vote_for: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useSkillDuel = (duelId?: string) => {
  const { user } = useAuth();
  const [duels, setDuels] = useState<SkillDuel[]>([]);
  const [currentDuel, setCurrentDuel] = useState<SkillDuel | null>(null);
  const [rounds, setRounds] = useState<DuelRound[]>([]);
  const [currentRound, setCurrentRound] = useState<DuelRound | null>(null);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [votes, setVotes] = useState<{ challenger: number; opponent: number }>({ challenger: 0, opponent: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active duels
  const fetchDuels = useCallback(async () => {
    const { data, error } = await supabase
      .from("skill_duels")
      .select(`
        *,
        challenger:profiles!skill_duels_challenger_id_fkey(first_name, last_name, avatar_url, total_points),
        opponent:profiles!skill_duels_opponent_id_fkey(first_name, last_name, avatar_url, total_points),
        category:categories!skill_duels_category_id_fkey(name)
      `)
      .in("status", ["waiting", "active", "voting"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDuels(data);
    }
    setLoading(false);
  }, []);

  // Fetch duel details
  const fetchDuel = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("skill_duels")
      .select(`
        *,
        challenger:profiles!skill_duels_challenger_id_fkey(first_name, last_name, avatar_url, total_points),
        opponent:profiles!skill_duels_opponent_id_fkey(first_name, last_name, avatar_url, total_points),
        category:categories!skill_duels_category_id_fkey(name)
      `)
      .eq("id", id)
      .single();

    if (data) {
      setCurrentDuel(data);
    }
  }, []);

  // Fetch rounds
  const fetchRounds = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("duel_rounds")
      .select("*")
      .eq("duel_id", id)
      .order("round_number");

    if (data) {
      setRounds(data.map(r => ({
        ...r,
        options: r.options as { id: string; text: string }[]
      })));
    }
  }, []);

  // Fetch spectators
  const fetchSpectators = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("duel_spectators")
      .select(`
        *,
        profile:profiles!duel_spectators_user_id_fkey(first_name, last_name, avatar_url)
      `)
      .eq("duel_id", id);

    if (data) {
      setSpectators(data);
      const challengerVotes = data.filter(s => s.vote_for === currentDuel?.challenger_id).length;
      const opponentVotes = data.filter(s => s.vote_for === currentDuel?.opponent_id).length;
      setVotes({ challenger: challengerVotes, opponent: opponentVotes });
    }
  }, [currentDuel]);

  // Create duel challenge
  const createDuel = async (data: {
    category_id?: string;
    stake_points?: number;
    total_rounds?: number;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data: duel, error } = await supabase
      .from("skill_duels")
      .insert({
        ...data,
        challenger_id: user.id
      })
      .select()
      .single();

    if (!error) {
      await fetchDuels();
    }

    return { data: duel, error };
  };

  // Accept duel
  const acceptDuel = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("skill_duels")
      .update({
        opponent_id: user.id,
        status: "active",
        started_at: new Date().toISOString()
      })
      .eq("id", id);

    if (!error) {
      await fetchDuel(id);
    }

    return { error };
  };

  // Submit answer
  const submitAnswer = async (roundId: string, optionId: string, timeMs: number) => {
    if (!user || !currentDuel || hasAnswered) return { error: new Error("Cannot submit") };

    const isChallenger = user.id === currentDuel.challenger_id;
    const updateField = isChallenger
      ? { challenger_answer: optionId, challenger_time_ms: timeMs }
      : { opponent_answer: optionId, opponent_time_ms: timeMs };

    const { error } = await supabase
      .from("duel_rounds")
      .update(updateField)
      .eq("id", roundId);

    if (!error) {
      setHasAnswered(true);
      await fetchRounds(currentDuel.id);
    }

    return { error };
  };

  // Join as spectator
  const joinAsSpectator = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("duel_spectators")
      .insert({ duel_id: id, user_id: user.id });

    if (!error && duelId) {
      await fetchSpectators(id);
    }

    return { error };
  };

  // Vote for player
  const voteFor = async (playerId: string) => {
    if (!user || !duelId) return { error: new Error("Cannot vote") };

    const { error } = await supabase
      .from("duel_spectators")
      .update({ vote_for: playerId })
      .eq("duel_id", duelId)
      .eq("user_id", user.id);

    if (!error) {
      await fetchSpectators(duelId);
    }

    return { error };
  };

  // Timer effect
  useEffect(() => {
    if (currentDuel?.status === "active" && currentRound) {
      const roundTime = currentDuel.round_time_seconds || 60;
      setTimeLeft(roundTime);
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
  }, [currentDuel?.status, currentRound?.id]);

  // Update current round
  useEffect(() => {
    if (currentDuel && rounds.length > 0) {
      const roundIdx = currentDuel.current_round || 0;
      setCurrentRound(rounds[roundIdx] || null);
    }
  }, [currentDuel?.current_round, rounds]);

  // Initial fetch
  useEffect(() => {
    fetchDuels();
  }, [fetchDuels]);

  // Fetch duel details if ID provided
  useEffect(() => {
    if (duelId) {
      fetchDuel(duelId);
      fetchRounds(duelId);
      fetchSpectators(duelId);
    }
  }, [duelId, fetchDuel, fetchRounds, fetchSpectators]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("duel-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "skill_duels"
      }, (payload) => {
        if (payload.eventType === "UPDATE" && duelId) {
          fetchDuel(duelId);
        }
        fetchDuels();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "duel_rounds",
        filter: duelId ? `duel_id=eq.${duelId}` : undefined
      }, () => {
        if (duelId) fetchRounds(duelId);
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "duel_spectators",
        filter: duelId ? `duel_id=eq.${duelId}` : undefined
      }, () => {
        if (duelId) fetchSpectators(duelId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [duelId, fetchDuels, fetchDuel, fetchRounds, fetchSpectators]);

  return {
    duels,
    currentDuel,
    rounds,
    currentRound,
    spectators,
    votes,
    timeLeft,
    hasAnswered,
    loading,
    createDuel,
    acceptDuel,
    submitAnswer,
    joinAsSpectator,
    voteFor,
    refetch: fetchDuels
  };
};
