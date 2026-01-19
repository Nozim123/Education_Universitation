import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;
type Category = Tables<"categories">;
type Profile = Tables<"profiles">;

interface ArticleWithDetails extends Article {
  author: Profile | null;
  category: Category | null;
}

export const useArticles = () => {
  const [articles, setArticles] = useState<ArticleWithDetails[]>([]);
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

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("articles")
        .select(`
          *,
          author:profiles!articles_author_id_fkey(*),
          category:categories!articles_category_id_fkey(*)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setArticles((data as ArticleWithDetails[]) || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Create a new article
  const createArticle = async (articleData: {
    title: string;
    content: string;
    excerpt?: string;
    category_id?: string;
    is_research?: boolean;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({
        ...articleData,
        author_id: user.id,
        status: "published",
        read_time: Math.ceil((articleData.content?.length || 0) / 1000),
      })
      .select()
      .single();

    if (!error) {
      fetchArticles();
    }

    return { data, error };
  };

  // Like an article
  const likeArticle = async (articleId: string, userId: string) => {
    const { error } = await supabase
      .from("likes")
      .insert({ article_id: articleId, user_id: userId });

    if (!error) {
      setArticles(prev =>
        prev.map(a =>
          a.id === articleId
            ? { ...a, like_count: (a.like_count || 0) + 1 }
            : a
        )
      );
    }

    return { error };
  };

  // Unlike an article
  const unlikeArticle = async (articleId: string, userId: string) => {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("article_id", articleId)
      .eq("user_id", userId);

    if (!error) {
      setArticles(prev =>
        prev.map(a =>
          a.id === articleId
            ? { ...a, like_count: Math.max((a.like_count || 0) - 1, 0) }
            : a
        )
      );
    }

    return { error };
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Real-time subscription for article updates
  useEffect(() => {
    const channel = supabase
      .channel("articles-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        () => {
          fetchArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchArticles]);

  return {
    articles,
    categories,
    loading,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    createArticle,
    likeArticle,
    unlikeArticle,
    refetch: fetchArticles,
  };
};
