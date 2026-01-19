import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Eye, 
  Search,
  Filter,
  Clock,
  Star,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideos } from "@/hooks/useVideos";
import { useAuth } from "@/hooks/useAuth";

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (count: number | null) => {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const Videos = () => {
  const { user } = useAuth();
  const {
    videos,
    categories,
    loading,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    likeVideo,
  } = useVideos();

  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  const handleLike = async (videoId: string) => {
    if (!user) return;
    
    if (likedVideos.has(videoId)) {
      setLikedVideos(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    } else {
      setLikedVideos(prev => new Set(prev).add(videoId));
      await likeVideo(videoId, user.id);
    }
  };

  const featuredVideos = videos.filter((v) => v.is_featured);
  const regularVideos = videos.filter((v) => !v.is_featured);

  const getCategoryEmoji = (categoryName: string | undefined) => {
    const emojiMap: Record<string, string> = {
      Economics: "📊",
      Medicine: "🏥",
      Languages: "🌍",
      Technology: "💻",
      Science: "🔬",
      Arts: "🎨",
      Mathematics: "📐",
      Psychology: "🧠",
      Law: "⚖️",
      Engineering: "⚙️",
    };
    return emojiMap[categoryName || ""] || "📚";
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
              Video <span className="text-gradient">Textbook</span>
            </h1>
            <p className="text-muted-foreground">
              Learn from the best educators across all subjects
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 overflow-x-auto"
          >
            <Tabs 
              value={selectedCategory || "all"} 
              onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}
            >
              <TabsList className="bg-muted/50 p-1 inline-flex">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No videos available in this category"}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Featured Videos */}
              {featuredVideos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-gold" />
                    Featured
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {featuredVideos.map((video, index) => (
                        <motion.div
                          key={video.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                          className="group cursor-pointer"
                        >
                          <div className="bg-card rounded-2xl border overflow-hidden hover:shadow-card transition-all hover:-translate-y-1">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
                              {video.thumbnail_url ? (
                                <img 
                                  src={video.thumbnail_url} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                  {getCategoryEmoji(video.category?.name)}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                  <Play className="w-6 h-6 text-primary-foreground ml-1" />
                                </div>
                              </div>
                              <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(video.duration)}
                              </Badge>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                {video.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {video.author?.first_name} {video.author?.last_name}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {formatViews(video.view_count)}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLike(video.id);
                                    }}
                                    className={`flex items-center gap-1 transition-colors ${
                                      likedVideos.has(video.id) ? "text-destructive" : "hover:text-destructive"
                                    }`}
                                  >
                                    <Heart className={`w-3 h-3 ${likedVideos.has(video.id) ? "fill-current" : ""}`} />
                                    {video.like_count || 0}
                                  </button>
                                </div>
                                {video.rating_count && video.rating_sum ? (
                                  <div className="flex items-center gap-1 text-gold">
                                    <Star className="w-3 h-3 fill-gold" />
                                    {(video.rating_sum / video.rating_count).toFixed(1)}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* All Videos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">All Videos</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {regularVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="group cursor-pointer"
                      >
                        <div className="bg-card rounded-xl border overflow-hidden hover:shadow-card transition-all hover:-translate-y-1">
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative">
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                                {getCategoryEmoji(video.category?.name)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                              </div>
                            </div>
                            <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border-0 text-xs">
                              {formatDuration(video.duration)}
                            </Badge>
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {video.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {video.author?.first_name} {video.author?.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatViews(video.view_count)}
                              </span>
                              {video.rating_count && video.rating_sum ? (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-gold fill-gold" />
                                  {(video.rating_sum / video.rating_count).toFixed(1)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Videos;
