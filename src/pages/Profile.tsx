import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { 
  Video, 
  FileText, 
  Briefcase, 
  Trophy, 
  Settings, 
  Share2,
  Users,
  Eye,
  Heart,
  Star,
  Award,
  TrendingUp,
  Wallet,
  Copy,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const { user, signOut } = useAuth();
  const { profile, badges, videos, articles, projects, loading } = useProfile();
  const { toast } = useToast();

  const handleCopyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split("@")[0] || "User";

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : displayName.slice(0, 2).toUpperCase();

  const stats = [
    { label: "Total Views", value: (profile?.video_points || 0).toLocaleString(), icon: Eye },
    { label: "Likes", value: "0", icon: Heart },
    { label: "Rating", value: (profile?.total_points || 0).toLocaleString(), icon: Trophy },
    { label: "Followers", value: "0", icon: Users },
  ];

  const progressToNext = Math.min(((profile?.total_points || 0) / 10000) * 100, 100);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Banner */}
        <div className="h-48 bg-gradient-to-br from-primary via-primary/80 to-accent relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative -mt-20 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage 
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                {(profile?.total_points || 0) >= 1000 && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-display font-bold">{displayName}</h1>
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="w-3 h-3" />
                    {(profile?.total_points || 0).toLocaleString()} pts
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">
                  {profile?.direction?.name || "Student"} @ <span className="text-foreground font-medium">
                    {profile?.university?.name || "University"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {badges.map((userBadge) => (
                    <Badge
                      key={userBadge.id}
                      className="text-white border-0"
                      style={{ backgroundColor: userBadge.badge.color || "#8B5CF6" }}
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {userBadge.badge.name}
                    </Badge>
                  ))}
                  {badges.length === 0 && (
                    <span className="text-sm text-muted-foreground">No badges yet</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-4 border hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Referral & Wallet Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            {/* Wallet */}
            <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-primary-foreground">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-6 h-6" />
                <span className="font-semibold">Wallet Balance</span>
              </div>
              <div className="font-display text-4xl font-bold mb-2">
                ${(profile?.wallet_balance || 0).toFixed(2)}
              </div>
              <div className="text-primary-foreground/70 text-sm">
                Account: {profile?.account_number || "Not set"}
              </div>
            </div>

            {/* Referral */}
            <div className="bg-card rounded-2xl p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <span className="font-semibold">Referral Program</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 bg-muted rounded-lg px-4 py-2 text-sm font-mono">
                  {profile?.referral_code || "No code"}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyReferral}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Referral balance</span>
                <span className="font-semibold text-success">${(profile?.referral_balance || 0).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Rating Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 border mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Progress to Next Level</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {(profile?.total_points || 0).toLocaleString()} / 10,000 pts
              </span>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.max(0, 10000 - (profile?.total_points || 0)).toLocaleString()} points to reach next level
            </p>
          </motion.div>

          {/* Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="w-full md:w-auto grid grid-cols-4 gap-1 bg-muted/50 p-1">
                <TabsTrigger value="videos" className="gap-2">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Articles</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
                <TabsTrigger value="rating" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Rating</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="mt-6">
                {videos.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-card rounded-xl border overflow-hidden hover:shadow-card transition-shadow group cursor-pointer"
                      >
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                          {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            "🎬"
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(video.view_count || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {(video.like_count || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No videos published yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="articles" className="mt-6">
                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-card rounded-xl border p-6 hover:shadow-card transition-shadow cursor-pointer group"
                      >
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(article.view_count || 0).toLocaleString()} reads
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {(article.like_count || 0).toLocaleString()} likes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No articles published yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((projectParticipation) => (
                      <div
                        key={projectParticipation.id}
                        className="bg-card rounded-xl border p-6 hover:shadow-card transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {projectParticipation.project.title}
                            </h3>
                            <Badge
                              variant={projectParticipation.status === "completed" ? "default" : "secondary"}
                            >
                              {projectParticipation.status || "Pending"}
                            </Badge>
                          </div>
                          {(projectParticipation.points_earned || 0) > 0 && (
                            <div className="text-right">
                              <div className="font-display font-bold text-xl text-primary">
                                +{projectParticipation.points_earned}
                              </div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No projects joined yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rating" className="mt-6">
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold text-lg mb-4">Rating Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Video Contributions", points: profile?.video_points || 0, color: "bg-blue-500" },
                      { label: "Articles & Research", points: profile?.article_points || 0, color: "bg-emerald-500" },
                      { label: "Project Participation", points: profile?.project_points || 0, color: "bg-purple-500" },
                      { label: "Challenge Wins", points: profile?.challenge_points || 0, color: "bg-amber-500" },
                    ].map((item) => {
                      const maxPoints = Math.max(
                        profile?.video_points || 0,
                        profile?.article_points || 0,
                        profile?.project_points || 0,
                        profile?.challenge_points || 0,
                        1
                      );
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.label}</span>
                            <span className="font-semibold">{item.points.toLocaleString()} pts</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} rounded-full`}
                              style={{ width: `${(item.points / maxPoints) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
