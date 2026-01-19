import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Video = Tables<"videos">;
type Category = Tables<"categories">;
type Profile = Tables<"profiles">;

interface VideoWithDetails extends Video {
  author: Profile | null;
  category: Category | null;
}

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
  }, []);

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("videos")
        .select(`
          *,
          author:profiles!videos_author_id_fkey(*),
          category:categories!videos_category_id_fkey(*)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVideos((data as VideoWithDetails[]) || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Like a video
  const likeVideo = async (videoId: string, userId: string) => {
    const { error } = await supabase
      .from("likes")
      .insert({ video_id: videoId, user_id: userId });

    if (!error) {
      // Update local state
      setVideos(prev =>
        prev.map(v =>
          v.id === videoId
            ? { ...v, like_count: (v.like_count || 0) + 1 }
            : v
        )
      );
    }

    return { error };
  };

  // Unlike a video
  const unlikeVideo = async (videoId: string, userId: string) => {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", userId);

    if (!error) {
      setVideos(prev =>
        prev.map(v =>
          v.id === videoId
            ? { ...v, like_count: Math.max((v.like_count || 0) - 1, 0) }
            : v
        )
      );
    }

    return { error };
  };

  // Record a view
  const recordView = async (videoId: string, userId?: string) => {
    await supabase.from("video_views").insert({
      video_id: videoId,
      user_id: userId || null,
    });

    // Update local state
    setVideos(prev =>
      prev.map(v =>
        v.id === videoId
          ? { ...v, view_count: (v.view_count || 0) + 1 }
          : v
      )
    );
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Real-time subscription for video updates
  useEffect(() => {
    const channel = supabase
      .channel("videos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVideos]);

  return {
    videos,
    categories,
    loading,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    likeVideo,
    unlikeVideo,
    recordView,
    refetch: fetchVideos,
  };
};
