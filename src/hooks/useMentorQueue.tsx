import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface QueueRequest {
  id: string;
  student_id: string;
  mentor_id: string | null;
  topic: string;
  description: string | null;
  category_id: string | null;
  status: string;
  priority: number | null;
  queue_position: number | null;
  estimated_wait_minutes: number | null;
  created_at: string | null;
  student?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  mentor?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  category?: {
    name: string;
  };
}

export const useMentorQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueRequest[]>([]);
  const [myRequest, setMyRequest] = useState<QueueRequest | null>(null);
  const [myMentoringRequests, setMyMentoringRequests] = useState<QueueRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch entire queue
  const fetchQueue = useCallback(async () => {
    const { data, error } = await supabase
      .from("mentor_queue")
      .select(`
        *,
        student:profiles!mentor_queue_student_id_fkey(first_name, last_name, avatar_url),
        mentor:profiles!mentor_queue_mentor_id_fkey(first_name, last_name, avatar_url),
        category:categories!mentor_queue_category_id_fkey(name)
      `)
      .in("status", ["waiting", "accepted", "in_progress"])
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });

    if (!error && data) {
      // Calculate queue positions
      const withPositions = data.map((req, idx) => ({
        ...req,
        queue_position: idx + 1,
        estimated_wait_minutes: (idx + 1) * 5 // Rough estimate
      }));
      setQueue(withPositions);

      // Find user's request
      if (user) {
        const userRequest = withPositions.find(r => r.student_id === user.id && r.status === "waiting");
        setMyRequest(userRequest || null);

        // Find requests being mentored by user
        const mentoring = withPositions.filter(r => r.mentor_id === user.id);
        setMyMentoringRequests(mentoring);
      }
    }
    setLoading(false);
  }, [user]);

  // Request help
  const requestHelp = async (data: {
    topic: string;
    description?: string;
    category_id?: string;
    priority?: number;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Check if user already has an active request
    if (myRequest) {
      return { error: new Error("You already have an active request") };
    }

    const { data: request, error } = await supabase
      .from("mentor_queue")
      .insert({
        ...data,
        student_id: user.id
      })
      .select(`
        *,
        student:profiles!mentor_queue_student_id_fkey(first_name, last_name, avatar_url),
        category:categories!mentor_queue_category_id_fkey(name)
      `)
      .single();

    if (!error) {
      await fetchQueue();
    }

    return { data: request, error };
  };

  // Cancel request
  const cancelRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("mentor_queue")
      .update({ status: "cancelled" })
      .eq("id", requestId);

    if (!error) {
      await fetchQueue();
    }

    return { error };
  };

  // Accept request (as mentor)
  const acceptRequest = async (requestId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("mentor_queue")
      .update({
        mentor_id: user.id,
        status: "accepted",
        accepted_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (!error) {
      await fetchQueue();
    }

    return { error };
  };

  // Start session
  const startSession = async (requestId: string) => {
    const { error } = await supabase
      .from("mentor_queue")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (!error) {
      await fetchQueue();
    }

    return { error };
  };

  // Complete session
  const completeSession = async (requestId: string) => {
    const { error } = await supabase
      .from("mentor_queue")
      .update({
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (!error) {
      await fetchQueue();
    }

    return { error };
  };

  // Initial fetch
  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("mentor-queue-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "mentor_queue"
      }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQueue]);

  return {
    queue,
    myRequest,
    myMentoringRequests,
    loading,
    requestHelp,
    cancelRequest,
    acceptRequest,
    startSession,
    completeSession,
    refetch: fetchQueue
  };
};
