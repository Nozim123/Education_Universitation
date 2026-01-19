import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type University = Tables<"universities">;
type Direction = Tables<"directions">;

interface ProfileWithRelations extends Profile {
  university?: University | null;
  direction?: Direction | null;
}

interface UserBadge {
  id: string;
  earned_at: string | null;
  badge: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
  };
}

interface UserVideo {
  id: string;
  title: string;
  thumbnail_url: string | null;
  view_count: number | null;
  like_count: number | null;
}

interface UserArticle {
  id: string;
  title: string;
  view_count: number | null;
  like_count: number | null;
}

interface UserProject {
  id: string;
  status: string | null;
  points_earned: number | null;
  project: {
    id: string;
    title: string;
    status: string | null;
  };
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch profile with university and direction
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            *,
            university:universities(*),
            direction:directions(*)
          `)
          .eq("id", targetUserId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user badges
        const { data: badgesData } = await supabase
          .from("user_badges")
          .select(`
            id,
            earned_at,
            badge:badges(id, name, description, icon, color)
          `)
          .eq("user_id", targetUserId);

        setBadges((badgesData as UserBadge[]) || []);

        // Fetch user's videos
        const { data: videosData } = await supabase
          .from("videos")
          .select("id, title, thumbnail_url, view_count, like_count")
          .eq("author_id", targetUserId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(10);

        setVideos(videosData || []);

        // Fetch user's articles
        const { data: articlesData } = await supabase
          .from("articles")
          .select("id, title, view_count, like_count")
          .eq("author_id", targetUserId)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(10);

        setArticles(articlesData || []);

        // Fetch user's project participations
        const { data: projectsData } = await supabase
          .from("project_participants")
          .select(`
            id,
            status,
            points_earned,
            project:projects(id, title, status)
          `)
          .eq("user_id", targetUserId)
          .order("joined_at", { ascending: false })
          .limit(10);

        setProjects((projectsData as UserProject[]) || []);

      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!targetUserId) return { error: new Error("No user ID") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", targetUserId);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  return {
    profile,
    badges,
    videos,
    articles,
    projects,
    loading,
    error,
    updateProfile,
  };
};
