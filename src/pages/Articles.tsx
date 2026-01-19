import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  FileText, 
  Search,
  Filter,
  Heart,
  Eye,
  MessageCircle,
  Clock,
  BookOpen,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArticles } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { CreateArticleDialog } from "@/components/articles/CreateArticleDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Articles = () => {
  const { 
    articles, 
    categories, 
    loading, 
    selectedCategory, 
    searchQuery,
    setSelectedCategory, 
    setSearchQuery,
    createArticle,
    likeArticle,
    unlikeArticle 
  } = useArticles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  // Fetch user's liked articles
  useEffect(() => {
    const fetchLikedArticles = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("likes")
        .select("article_id")
        .eq("user_id", user.id)
        .not("article_id", "is", null);
      
      if (data) {
        setLikedArticles(new Set(data.map(l => l.article_id!)));
      }
    };

    fetchLikedArticles();
  }, [user]);

  const handleLike = async (articleId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles",
        variant: "destructive",
      });
      return;
    }

    if (likedArticles.has(articleId)) {
      await unlikeArticle(articleId, user.id);
      setLikedArticles(prev => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    } else {
      await likeArticle(articleId, user.id);
      setLikedArticles(prev => new Set(prev).add(articleId));
    }
  };

  const featuredArticles = articles.filter(a => a.is_featured);
  const latestArticles = articles.filter(a => !a.is_featured);

  const formatViews = (count: number | null) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Articles & <span className="text-gradient">Research</span>
            </h1>
            <p className="text-muted-foreground">
              Explore scientific works and articles from students worldwide
            </p>
          </motion.div>

          {/* Search & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {user && (
              <CreateArticleDialog 
                categories={categories}
                onCreateArticle={createArticle}
              />
            )}
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Tabs value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
                >
                  All
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search or filters"
                  : "Be the first to publish an article!"
                }
              </p>
            </div>
          )}

          {/* Featured Articles */}
          {!loading && featuredArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Featured Research
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {featuredArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                      className="bg-card rounded-2xl border p-6 hover:shadow-card transition-all hover:-translate-y-1 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {article.category && (
                          <Badge variant="secondary">{article.category.name}</Badge>
                        )}
                        {article.is_research && (
                          <Badge variant="outline" className="text-xs">Research</Badge>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.read_time || 5} min
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt || article.content?.slice(0, 150)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={article.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author?.first_name}`} />
                            <AvatarFallback>
                              {article.author?.first_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">
                              {article.author?.first_name} {article.author?.last_name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatViews(article.view_count)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(article.id);
                            }}
                            className={`flex items-center gap-1 transition-colors ${
                              likedArticles.has(article.id) ? "text-red-500" : "hover:text-red-500"
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${likedArticles.has(article.id) ? "fill-current" : ""}`} />
                            {article.like_count || 0}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* All Articles */}
          {!loading && latestArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Latest Articles</h2>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {latestArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className="bg-card rounded-xl border p-5 hover:shadow-card transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {article.category && (
                              <Badge variant="outline" className="text-xs">
                                {article.category.name}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {article.read_time || 5} min read
                            </span>
                          </div>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {article.excerpt || article.content?.slice(0, 100)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={article.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author?.first_name}`} />
                              <AvatarFallback>
                                {article.author?.first_name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {article.author?.first_name} {article.author?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatViews(article.view_count)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(article.id);
                              }}
                              className={`flex items-center gap-1 transition-colors ${
                                likedArticles.has(article.id) ? "text-red-500" : "hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${likedArticles.has(article.id) ? "fill-current" : ""}`} />
                              {article.like_count || 0}
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {article.comment_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Articles;
