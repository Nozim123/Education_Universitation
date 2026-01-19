import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface OnlineUser {
  id: string;
  user_id: string;
  current_page: string | null;
  current_activity: string | null;
  is_online: boolean | null;
  last_seen: string | null;
  session_started: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    total_points: number | null;
  };
}

interface DashboardStats {
  totalUsers: number;
  onlineUsers: number;
  activeArenas: number;
  activeDuels: number;
  queuedRequests: number;
  todayNewUsers: number;
  totalVideos: number;
  totalArticles: number;
}

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string | null;
}

export const useAdminDashboard = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    onlineUsers: 0,
    activeArenas: 0,
    activeDuels: 0,
    queuedRequests: 0,
    todayNewUsers: 0,
    totalVideos: 0,
    totalArticles: 0
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  }, [user]);

  // Fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    const { data } = await supabase
      .from("user_presence")
      .select(`
        *,
        profile:profiles!user_presence_user_id_fkey(first_name, last_name, email, avatar_url, total_points)
      `)
      .eq("is_online", true)
      .order("last_seen", { ascending: false });

    if (data) {
      setOnlineUsers(data);
    }
  }, []);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      usersResult,
      onlineResult,
      arenasResult,
      duelsResult,
      queueResult,
      newUsersResult,
      videosResult,
      articlesResult
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("user_presence").select("id", { count: "exact", head: true }).eq("is_online", true),
      supabase.from("arena_sessions").select("id", { count: "exact", head: true }).in("status", ["waiting", "active"]),
      supabase.from("skill_duels").select("id", { count: "exact", head: true }).in("status", ["waiting", "active"]),
      supabase.from("mentor_queue").select("id", { count: "exact", head: true }).eq("status", "waiting"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("videos").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published")
    ]);

    setStats({
      totalUsers: usersResult.count || 0,
      onlineUsers: onlineResult.count || 0,
      activeArenas: arenasResult.count || 0,
      activeDuels: duelsResult.count || 0,
      queuedRequests: queueResult.count || 0,
      todayNewUsers: newUsersResult.count || 0,
      totalVideos: videosResult.count || 0,
      totalArticles: articlesResult.count || 0
    });
  }, []);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    const { data } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setActivityLogs(data);
    }
  }, []);

  // Log admin action
  const logAction = async (action: string, targetType?: string, targetId?: string, details?: Record<string, unknown>) => {
    if (!user) return;

    await supabase.from("admin_activity_logs").insert([{
      admin_id: user.id,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      details: details ? JSON.parse(JSON.stringify(details)) : null
    }]);

    await fetchActivityLogs();
  };

  // Update user presence
  const updatePresence = async (page: string, activity?: string) => {
    if (!user) return;

    await supabase.from("user_presence").upsert({
      user_id: user.id,
      current_page: page,
      current_activity: activity,
      is_online: true,
      last_seen: new Date().toISOString()
    }, { onConflict: "user_id" });
  };

  // Set user offline
  const setOffline = async () => {
    if (!user) return;

    await supabase
      .from("user_presence")
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq("user_id", user.id);
  };

  // Block user
  const blockUser = async (userId: string, reason: string) => {
    // In production, this would update a blocked status
    await logAction("block_user", "user", userId, { reason });
    return { error: null };
  };

  // Send warning
  const sendWarning = async (userId: string, message: string) => {
    // Create notification for the user
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "warning",
      title: "⚠️ Warning from Admin",
      message
    });

    await logAction("send_warning", "user", userId, { message });
    return { error: null };
  };

  // Broadcast message
  const broadcastMessage = async (message: string, type: "info" | "warning" | "announcement" = "announcement") => {
    // Get all online user IDs
    const { data: onlineData } = await supabase
      .from("user_presence")
      .select("user_id")
      .eq("is_online", true);

    if (onlineData) {
      const notifications = onlineData.map(u => ({
        user_id: u.user_id,
        type,
        title: type === "announcement" ? "📢 Announcement" : type === "warning" ? "⚠️ Alert" : "ℹ️ Info",
        message
      }));

      await supabase.from("notifications").insert(notifications);
    }

    await logAction("broadcast_message", "all", undefined, { message, type, recipients: onlineData?.length || 0 });
    return { error: null };
  };

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      await checkAdminStatus();
      await Promise.all([
        fetchOnlineUsers(),
        fetchStats(),
        fetchActivityLogs()
      ]);
      setLoading(false);
    };

    init();
  }, [checkAdminStatus, fetchOnlineUsers, fetchStats, fetchActivityLogs]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "user_presence"
      }, () => {
        fetchOnlineUsers();
        fetchStats();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "arena_sessions"
      }, () => {
        fetchStats();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "skill_duels"
      }, () => {
        fetchStats();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "mentor_queue"
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOnlineUsers, fetchStats]);

  return {
    onlineUsers,
    stats,
    activityLogs,
    loading,
    isAdmin,
    updatePresence,
    setOffline,
    logAction,
    blockUser,
    sendWarning,
    broadcastMessage,
    refetch: () => Promise.all([fetchOnlineUsers(), fetchStats(), fetchActivityLogs()])
  };
};
